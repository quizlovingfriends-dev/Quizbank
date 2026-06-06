"""
enrich_fundas_ai.py — Generate fundas via OpenRouter (free tier).

For every question with empty/short funda:
  - Send Q + A to a free OpenRouter model
  - Ask for 1-2 sentence factual trivia
  - Save into funda.text

Backups + JS-validation auto-rollback on failure.
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

MODEL = "google/gemma-4-26b-a4b-it:free"


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def call_llm(api_key, prompt, max_tokens=120):
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system",
             "content": "You write short, factual, trivia-style 'fundas' for quiz questions. "
                        "Always 1-2 sentences max. Plain text only, no markdown, no emojis. "
                        "Don't restate the question or answer; add NEW interesting context."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.5,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=body,
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://quizvault.netlify.app",
            "X-Title": "QuizVault",
        },
    )
    ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        result = json.loads(r.read().decode("utf-8", errors="replace"))
    return (result["choices"][0]["message"]["content"] or "").strip()


def make_prompt(question_text, answer_text):
    qt = re.sub(r"<[^>]+>", "", question_text or "").strip()
    at = re.sub(r"<[^>]+>", "", answer_text or "").strip()
    return (
        f"Quiz question: \"{qt}\"\n"
        f"Answer: \"{at}\"\n\n"
        f"Write a 1-2 sentence factual trivia 'funda' that adds interesting context "
        f"about the answer. Do not repeat the answer or rephrase the question. "
        f"Just give the funda text, no preamble."
    )


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
    esc = new_value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    pat = re.compile(
        r'("' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*)"((?:[^"\\]|\\.)*)"',
        re.DOTALL)
    return pat.sub(r'\1"' + esc + r'"', b, count=1)


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


def clean_funda(text):
    """Strip preamble like 'Here's a funda:' from the LLM output."""
    if not text: return ""
    s = text.strip()
    # Drop anything before "Funda:" if present
    s = re.sub(r"^(here's? a? ?funda:?|funda:|sure!?|of course!?)[\s,.\-]*", "",
               s, flags=re.IGNORECASE).strip()
    # Strip surrounding quotes
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    # Take first 2 sentences max
    sentences = re.split(r"(?<=[.!?])\s+", s)
    return " ".join(sentences[:3]).strip()[:400]


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")
    api_key = (cfg.get("openrouter_api_key", "") or "").strip()

    if not api_key:
        print("No openrouter_api_key in config.json"); sys.exit(1)

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".enrich_fundas_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"Backup: {bak}")

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
    print(f"Found {len(targets)} questions, {len(needs_funda)} need a funda.")

    new_text = text
    stats = {"generated": 0, "skipped_short": 0, "errors": 0}

    for i, t in enumerate(needs_funda):
        if not t["at"].strip():
            stats["skipped_short"] += 1; continue

        prompt = make_prompt(t["qt"], t["at"])
        try:
            raw = call_llm(api_key, prompt)
            funda = clean_funda(raw)
        except urllib.error.HTTPError as e:
            err_body = e.read()[:200].decode("utf-8", errors="replace")
            print(f"  Q{t['qid']:3d} HTTP {e.code}: {err_body[:80]}")
            stats["errors"] += 1
            # Rate-limit handling: wait if 429
            if e.code == 429:
                print("  Rate-limited — waiting 30s...")
                time.sleep(30)
            continue
        except Exception as e:
            print(f"  Q{t['qid']:3d} ERROR: {e}")
            stats["errors"] += 1
            continue

        if not funda or len(funda) < 25:
            stats["skipped_short"] += 1
            continue

        # Apply edit
        id_pat = re.compile(
            r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
            re.DOTALL)
        mm = id_pat.search(new_text)
        if not mm: continue
        s_, e_ = mm.span()
        new_block = replace_nested_text(mm.group(0), "funda", funda)
        new_text = new_text[:s_] + new_block + new_text[e_:]
        stats["generated"] += 1

        if (i + 1) % 5 == 0:
            print(f"  {i+1}/{len(needs_funda)}  generated={stats['generated']} errors={stats['errors']}")

        time.sleep(1.0)  # polite — gemma free tier is rate-limited

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)

    # Verify
    print("\nVerifying file parses as JS...")
    rc = subprocess.run(
        ["node", "-e",
         "const fs=require('fs');"
         f"const text=fs.readFileSync('{qs_path.replace(chr(92), '/')}','utf8');"
         "new Function(text+'\\nreturn QUIZ_QUESTIONS;')();"
         "console.log('OK');"],
        capture_output=True, text=True)
    if rc.returncode != 0:
        print("FAILED — restoring backup")
        print(rc.stderr[:500])
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print("OK")

    print("\n" + "=" * 60)
    print("FUNDA ENRICHMENT SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
