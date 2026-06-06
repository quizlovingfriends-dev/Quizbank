"""
enrich_fundas_pollinations.py — Free funda generation via Pollinations.ai.

No API key, no signup, no rate limit. Uses the OpenAI-compatible POST endpoint.

For each question with empty/short funda, generates 1-2 sentence trivia.
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

API_URL = "https://text.pollinations.ai/openai"
MODEL   = "openai"  # try "mistral" or "llama" if openai is rate-limited


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def call_llm(prompt, max_tokens=120, retries=3):
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
        "private": True,  # don't show in public feed
    }).encode("utf-8")

    ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE

    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                API_URL, data=body,
                headers={"Content-Type": "application/json", "User-Agent": "QuizVault/1.0"},
            )
            with urllib.request.urlopen(req, timeout=45, context=ctx) as r:
                result = json.loads(r.read().decode("utf-8", errors="replace"))
            content = (result.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
            if content: return content
        except Exception as e:
            last_err = e
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    raise last_err or RuntimeError("empty response")


def make_prompt(question_text, answer_text):
    qt = re.sub(r"<[^>]+>", "", question_text or "").strip()
    at = re.sub(r"<[^>]+>", "", answer_text or "").strip()
    return (
        f"Quiz Q: {qt}\nAnswer: {at}\n\n"
        f"Write a 1-2 sentence factual 'funda' adding interesting context "
        f"about the answer. No preamble. No 'Funda:' prefix. Just the trivia text."
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
    # Escape EVERYTHING that could break JS string parsing
    esc = (new_value
           .replace("\\", "\\\\")
           .replace('"', '\\"')
           .replace("\r", "")        # strip CR completely (Windows newlines)
           .replace("\n", " ")       # collapse newlines to spaces
           .replace("\t", " ")
           .replace(" ", " ")   # JS line separators
           .replace(" ", " "))
    pat = re.compile(
        r'("' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*)"((?:[^"\\]|\\.)*)"',
        re.DOTALL)
    return pat.sub(r'\1"' + esc + r'"', b, count=1)


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


def clean_funda(text):
    if not text: return ""
    s = text.strip()
    s = re.sub(r"^(here'?s? a? ?funda:?|funda:|sure!?|of course!?|here'?s some trivia:?)[\s,.\-]*", "",
               s, flags=re.IGNORECASE).strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()
    sentences = re.split(r"(?<=[.!?])\s+", s)
    return " ".join(sentences[:3]).strip()[:400]


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".pollinations_{stamp}.bak"
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
    print(f"Found {len(targets)} questions, {len(needs_funda)} need a funda.", flush=True)

    new_text = text
    stats = {"generated": 0, "errors": 0, "skipped_short": 0}

    for i, t in enumerate(needs_funda):
        if not t["at"].strip():
            stats["skipped_short"] += 1; continue

        prompt = make_prompt(t["qt"], t["at"])
        try:
            raw = call_llm(prompt)
            funda = clean_funda(raw)
        except Exception as e:
            print(f"  Q{t['qid']:3d} ERROR: {str(e)[:120]}", flush=True)
            stats["errors"] += 1
            time.sleep(3)
            continue

        if not funda or len(funda) < 25:
            stats["skipped_short"] += 1; continue

        # Apply edit
        id_pat = re.compile(
            r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
            re.DOTALL)
        mm = id_pat.search(new_text)
        if not mm: continue
        s_, e_ = mm.span()
        new_text = new_text[:s_] + replace_nested_text(mm.group(0), "funda", funda) + new_text[e_:]
        stats["generated"] += 1

        if (i + 1) % 5 == 0:
            print(f"  {i+1}/{len(needs_funda)}  generated={stats['generated']} errors={stats['errors']}",
                  flush=True)

        # Save partial progress every 20 questions in case of crash
        if (i + 1) % 20 == 0:
            with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(new_text)
            print(f"    [partial save]", flush=True)

        time.sleep(0.8)  # polite

    # Final write
    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)

    # Verify
    print("\nVerifying file parses as JS...", flush=True)
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
    print("OK", flush=True)

    print("\n" + "=" * 60)
    print("POLLINATIONS FUNDA SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
