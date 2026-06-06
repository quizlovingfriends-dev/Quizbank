"""
enrich_fundas_github.py — Funda generation via GitHub Models (GPT-4o-mini).

Uses your GitHub PAT — no credit card, no organization.
Free tier: ~150 req/day, 15 req/min. Plenty for our needs.

Each funda generated, validated, and written individually so partial failures
don't lose work.
"""
import os
import re
import ssl
import sys
import json
import time
import shutil
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


def call_llm(token, prompt, max_tokens=120, retries=2):
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system",
             "content": "You write short, factual, trivia-style 'fundas' for quiz questions. "
                        "Always 1-2 sentences max. Plain text only. No markdown, no asterisks, "
                        "no emojis, no line breaks, no quotation marks around your output. "
                        "Don't restate the question or answer; add NEW interesting context."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.5,
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
            with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
                result = json.loads(r.read().decode("utf-8", errors="replace"))
            content = (result.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
            if content: return content
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:  # rate limit
                wait = 30 if attempt == 0 else 60
                print(f"  Rate limited — waiting {wait}s", flush=True)
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            last_err = e
            if attempt < retries: time.sleep(2 ** attempt)
    raise last_err or RuntimeError("empty response")


def make_prompt(question_text, answer_text):
    qt = re.sub(r"<[^>]+>", "", question_text or "").strip()
    at = re.sub(r"<[^>]+>", "", answer_text or "").strip()
    return (
        f"Quiz Q: {qt}\nAnswer: {at}\n\n"
        f"Write a 1-2 sentence factual 'funda' adding interesting context "
        f"about the answer. Plain text only. No asterisks, no quotes, no line breaks."
    )


def clean_funda(text):
    if not text: return ""
    s = text.strip()
    # Strip preambles
    s = re.sub(r"^(here'?s?( a)?( funda| trivia)?:?|funda:|sure!?|of course!?)[\s,.\-]*",
               "", s, flags=re.IGNORECASE).strip()
    # Strip surrounding quotes
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    # Strip markdown emphasis
    s = re.sub(r"\*+", "", s)
    s = re.sub(r"_+", "", s)
    s = re.sub(r"`+", "", s)
    # Strip stray --- at end
    s = re.sub(r"\s*-{2,}\s*$", "", s).strip()
    # Take first 2-3 sentences
    sentences = re.split(r"(?<=[.!?])\s+", s)
    out = " ".join(sentences[:3]).strip()[:400]
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


def replace_nested_text(b, k, new_value):
    """Escape EVERYTHING dangerous before injecting into JS source."""
    esc = (new_value
           .replace("\\", "\\\\")
           .replace('"', '\\"')
           .replace("\r", "")
           .replace("\n", " ")
           .replace("\t", " ")
           .replace(" ", " ")
           .replace(" ", " "))
    pat = re.compile(
        r'("' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*)"((?:[^"\\]|\\.)*)"',
        re.DOTALL)
    return pat.sub(r'\1"' + esc + r'"', b, count=1)


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


def verify_js(text):
    """Quick Node.js check that the text is valid JS. Returns True/False."""
    try:
        rc = subprocess.run(
            ["node", "-e", "new Function(require('fs').readFileSync(0,'utf8')+'\\nreturn QUIZ_QUESTIONS;')()"],
            input=text, capture_output=True, text=True, timeout=10)
        return rc.returncode == 0
    except Exception:
        return False


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")
    token = (cfg.get("github_models_token", "") or "").strip()
    if not token:
        print("No github_models_token in config.json"); sys.exit(1)

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".github_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"Backup: {bak}", flush=True)

    targets = []
    for m in OBJ_RE.finditer(text):
        b = m.group(0)
        targets.append({
            "qid":  get_id(b),
            "qt":   decode(get_nested_text(b, "question") or ""),
            "at":   decode(get_nested_text(b, "answer")   or ""),
            "ft":   decode(get_nested_text(b, "funda")    or ""),
        })

    needs_funda = [t for t in targets if not t["ft"].strip() or len(t["ft"]) < 30]
    print(f"{len(targets)} questions total, {len(needs_funda)} need a funda.", flush=True)

    current_text = text
    stats = {"generated": 0, "errors": 0, "validation_rejected": 0, "skipped_short": 0}

    for i, t in enumerate(needs_funda):
        if not t["at"].strip():
            stats["skipped_short"] += 1; continue

        try:
            raw = call_llm(token, make_prompt(t["qt"], t["at"]))
            funda = clean_funda(raw)
        except urllib.error.HTTPError as e:
            print(f"  Q{t['qid']:3d} HTTP {e.code}: {e.read()[:120].decode(errors='replace')}", flush=True)
            stats["errors"] += 1
            continue
        except Exception as e:
            print(f"  Q{t['qid']:3d} ERROR: {str(e)[:120]}", flush=True)
            stats["errors"] += 1
            continue

        if not funda or len(funda) < 25:
            stats["skipped_short"] += 1; continue

        # Apply edit IN MEMORY first, validate, then commit
        id_pat = re.compile(
            r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
            re.DOTALL)
        mm = id_pat.search(current_text)
        if not mm: continue
        s_, e_ = mm.span()
        candidate_text = current_text[:s_] + replace_nested_text(mm.group(0), "funda", funda) + current_text[e_:]

        # Per-edit validation: only keep if the file is still valid JS
        if verify_js(candidate_text):
            current_text = candidate_text
            stats["generated"] += 1
        else:
            stats["validation_rejected"] += 1
            print(f"  Q{t['qid']:3d} REJECTED (would invalidate JS): {funda[:60]!r}", flush=True)
            continue

        # Save partial progress every 10 questions
        if (i + 1) % 10 == 0:
            with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(current_text)
            print(f"  {i+1}/{len(needs_funda)}  generated={stats['generated']} "
                  f"errors={stats['errors']} rejected={stats['validation_rejected']} [saved]",
                  flush=True)

        time.sleep(0.7)  # ~85 req/min — well under 15 req/min daily quota? actually GitHub allows ~15 RPM, so 4s between

    # Final write + verification
    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(current_text)

    print("\nFinal verification...", flush=True)
    if not verify_js(current_text):
        print("FAIL — restoring backup")
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print("OK", flush=True)

    print("\n" + "=" * 60)
    print("GITHUB MODELS FUNDA SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
