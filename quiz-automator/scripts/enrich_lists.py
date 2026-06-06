"""
enrich_lists.py — For every question, generate 1-3 'related lists' a quiz student
should memorize to answer adjacent questions on the same theme.

Uses GitHub Models (GPT-4o-mini) — already wired up via config.json.

Example: a question about saffron → list of "Plant-derived spices by part used"
         (turmeric=rhizome, cinnamon=bark, cloves=flower buds, etc.)

Adds a `lists` field to each question:
  {
    id: 1,
    ...existing fields...,
    lists: [
      {
        "title": "Plant-derived spices by part used",
        "items": ["Saffron — stigmas (Crocus sativus)", "Cinnamon — inner bark", ...],
        "source": "ai"
      }
    ]
  }

USAGE:
  python scripts/enrich_lists.py                  # all questions
  python scripts/enrich_lists.py --only 1,5,12    # specific question IDs
  python scripts/enrich_lists.py --limit 20       # first N questions only
  python scripts/enrich_lists.py --dry-run        # print what would happen, no writes

Safety:
  - Backups questions.js before writing
  - Per-edit Node.js JS-syntax validation
  - Auto-rollback if any change breaks parse
  - Skips questions that already have lists (idempotent)
"""
import os
import re
import ssl
import sys
import json
import time
import shutil
import argparse
import urllib.request
import datetime
import subprocess

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

API_URL = "https://models.github.ai/inference/chat/completions"
MODEL   = "openai/gpt-4o-mini"


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def call_llm(token, prompt, max_tokens=600, retries=2):
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system",
             "content": (
                "You are a competitive quiz coach. For every quiz question I give you, "
                "your job is to identify the 1-3 most useful 'mental lists' a serious quiz "
                "student should memorize so they can answer adjacent questions on the same theme. "
                "Each list should be a coherent category with 5-15 specific items. "
                "Return STRICT JSON only, no markdown, no preamble: "
                '[{"title": "...", "items": ["item — short detail", "..."]}]'
            )},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.4,
    }).encode("utf-8")

    ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(API_URL, data=body, headers={
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=45, context=ctx) as r:
                result = json.loads(r.read().decode("utf-8", errors="replace"))
            content = (result.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
            if content: return content
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                wait = 30 if attempt == 0 else 60
                print(f"  Rate limited — waiting {wait}s", flush=True)
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            last_err = e
            if attempt < retries: time.sleep(2 ** attempt)
    raise last_err or RuntimeError("empty response")


def make_prompt(question_text, answer_text, funda_text):
    qt = re.sub(r"<[^>]+>", "", question_text or "").strip()
    at = re.sub(r"<[^>]+>", "", answer_text or "").strip()
    ft = re.sub(r"<[^>]+>", "", funda_text  or "").strip()
    return (
        f"Question: {qt}\n"
        f"Answer: {at}\n"
        f"Funda: {ft}\n\n"
        f"Identify 1-3 mental lists a quiz student should memorize to answer "
        f"questions on this theme. For each list: a clear title and 5-15 items. "
        f"Each item should be a single line: 'Name — short detail'. "
        f"Return ONLY a JSON array. No markdown fences."
    )


def parse_lists_json(raw):
    """Parse and validate the LLM output. Returns [] if invalid."""
    if not raw: return []
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?", "", s).rstrip("`").strip()
    try:
        data = json.loads(s)
    except Exception:
        return []
    if not isinstance(data, list): return []
    out = []
    for item in data[:3]:
        if not isinstance(item, dict): continue
        title = (item.get("title") or "").strip()[:120]
        items = item.get("items") or []
        if not title or not isinstance(items, list): continue
        cleaned_items = []
        for x in items[:15]:
            if isinstance(x, str):
                cleaned_items.append(x.strip()[:200])
            elif isinstance(x, dict) and x.get("text"):
                cleaned_items.append(str(x["text"]).strip()[:200])
        if len(cleaned_items) >= 3:
            out.append({"title": title, "items": cleaned_items, "source": "ai"})
    return out


# ── Surgical regex on questions.js ───────────────────────────────────────────
OBJ_RE = re.compile(r'\{\s*"id"\s*:\s*\d+[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}', re.DOTALL)


def get_id(b):
    m = re.search(r'"id"\s*:\s*(\d+)', b); return int(m.group(1)) if m else None


def get_nested_text(b, k):
    m = re.search(
        r'"' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*"((?:[^"\\]|\\.)*)"',
        b, re.DOTALL)
    return m.group(1) if m else None


def has_lists_field(b):
    return bool(re.search(r'"lists"\s*:\s*\[', b))


def inject_lists_field(block, lists_array):
    """Insert a lists field into the block, right before the closing }."""
    if not lists_array: return block, False
    js_value = json.dumps(lists_array, ensure_ascii=False)
    # Inject before the final }
    new_block = re.sub(r"\}\s*$", ",\n  \"lists\": " + js_value + "\n}", block, count=1)
    return new_block, True


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


def verify_js(text):
    try:
        rc = subprocess.run(
            ["node", "-e", "new Function(require('fs').readFileSync(0,'utf8')+'\\nreturn QUIZ_QUESTIONS;')()"],
            input=text, capture_output=True, text=True, timeout=10)
        return rc.returncode == 0
    except Exception:
        return False


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="comma-separated question IDs to process", default="")
    ap.add_argument("--limit", type=int, help="process at most N questions", default=0)
    ap.add_argument("--dry-run", action="store_true", help="don't write, just print")
    ap.add_argument("--force", action="store_true", help="regenerate even if lists exist")
    args = ap.parse_args()

    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")
    token = (cfg.get("github_models_token", "") or "").strip()
    if not token:
        print("No github_models_token in config.json"); sys.exit(1)

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".lists_{stamp}.bak"
    if not args.dry_run:
        shutil.copy2(qs_path, bak)
        print(f"Backup: {bak}", flush=True)

    only_ids = set()
    if args.only:
        only_ids = {int(x.strip()) for x in args.only.split(",") if x.strip().isdigit()}

    targets = []
    for m in OBJ_RE.finditer(text):
        b = m.group(0)
        qid = get_id(b)
        if only_ids and qid not in only_ids: continue
        if not args.force and has_lists_field(b): continue
        targets.append({
            "qid": qid,
            "qt":  decode(get_nested_text(b, "question") or ""),
            "at":  decode(get_nested_text(b, "answer")   or ""),
            "ft":  decode(get_nested_text(b, "funda")    or ""),
        })

    if args.limit > 0:
        targets = targets[:args.limit]

    print(f"Will process {len(targets)} questions.", flush=True)
    if args.dry_run:
        for t in targets[:5]:
            print(f"  Q{t['qid']}: {t['qt'][:60]}...")
        if len(targets) > 5: print(f"  ... and {len(targets) - 5} more")
        return

    current_text = text
    stats = {"generated": 0, "errors": 0, "invalid_json": 0, "validation_rejected": 0}

    for i, t in enumerate(targets):
        if not t["at"].strip(): continue
        prompt = make_prompt(t["qt"], t["at"], t["ft"])
        try:
            raw = call_llm(token, prompt)
            lists = parse_lists_json(raw)
        except urllib.error.HTTPError as e:
            print(f"  Q{t['qid']:3d} HTTP {e.code}: {e.read()[:100].decode(errors='replace')}", flush=True)
            stats["errors"] += 1; continue
        except Exception as e:
            print(f"  Q{t['qid']:3d} ERROR: {str(e)[:100]}", flush=True)
            stats["errors"] += 1; continue

        if not lists:
            stats["invalid_json"] += 1; continue

        # Apply candidate edit, validate, commit if good
        id_pat = re.compile(
            r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
            re.DOTALL)
        mm = id_pat.search(current_text)
        if not mm: continue
        s_, e_ = mm.span()
        new_block, ok = inject_lists_field(mm.group(0), lists)
        if not ok: continue
        candidate = current_text[:s_] + new_block + current_text[e_:]

        if verify_js(candidate):
            current_text = candidate
            stats["generated"] += 1
            if (i + 1) % 10 == 0:
                with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
                    f.write(current_text)
                print(f"  {i+1}/{len(targets)}  generated={stats['generated']} errors={stats['errors']} [saved]",
                      flush=True)
        else:
            stats["validation_rejected"] += 1
            print(f"  Q{t['qid']:3d} REJECTED (JS invalid)", flush=True)

        time.sleep(0.7)

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(current_text)

    print("\nFinal verification...", flush=True)
    if not verify_js(current_text):
        print("FAIL — restoring backup")
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print("OK", flush=True)

    print("\n" + "=" * 60)
    print("LISTS ENRICHMENT SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
