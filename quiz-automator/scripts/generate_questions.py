"""
generate_questions.py — Generate brand-new quiz questions via GitHub Models (GPT-4o-mini).

Usage:
  python scripts/generate_questions.py --topic "ancient egypt" --count 20 --difficulty hard
  python scripts/generate_questions.py --topic "indian cricket" --count 50 --difficulty medium
  python scripts/generate_questions.py --topic "wildlife" --count 10 --difficulty easy --dry-run
  python scripts/generate_questions.py --topic "geography" --count 30 --apply   # auto-pipe to updater

What it does:
  1. Asks GPT-4o-mini to write N quiz questions on a topic at given difficulty
  2. Parses the structured JSON output (one batch at a time, retries on bad JSON)
  3. Saves to a JSON file (flat-shape, same as extractor output)
  4. Optional --apply: pipes that JSON straight into questions_updater.py
     (which routes through the quality gate from Project A)

Cost: ~$0.0005 per question on GitHub Models free tier.
       50 questions = ~$0.025, well within daily free quota.
"""
import os
import re
import ssl
import sys
import json
import time
import argparse
import urllib.request
import subprocess
import datetime

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

API_URL = "https://models.github.ai/inference/chat/completions"
MODEL   = "openai/gpt-4o-mini"

ALLOWED_TOPICS = [
    "sports", "wildlife", "current-affairs", "history", "politics",
    "cuisines", "science", "literature", "geography", "general",
]

ALLOWED_DIFFICULTY = ["easy", "medium", "hard"]


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── LLM call ───────────────────────────────────────────────────────────────
def call_llm(token, prompt, max_tokens=2000, retries=2):
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": (
                "You are an expert competitive-quiz writer. You write factual, well-researched "
                "trivia questions for serious quizzers (think KBC, IIT/IIM quizzing, MasterMind). "
                "Each question has ONE definite answer that can be verified. You include a 'funda' "
                "with extra context. You return STRICT JSON only — no markdown, no preamble."
            )},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }).encode("utf-8")

    ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(API_URL, data=body, headers={
                "Authorization": "Bearer " + token,
                "Content-Type":  "application/json",
                "Accept":        "application/json",
            })
            with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
                result = json.loads(r.read().decode("utf-8", errors="replace"))
            content = (result.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
            if content: return content
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                wait = 30 if attempt == 0 else 60
                print(f"  Rate-limited — waiting {wait}s", flush=True)
                time.sleep(wait); continue
            raise
        except Exception as e:
            last_err = e
            if attempt < retries: time.sleep(2 ** attempt)
    raise last_err or RuntimeError("empty response")


# ── Prompt builder ─────────────────────────────────────────────────────────
def build_prompt(topic, count, difficulty, used_titles=None):
    used_titles = used_titles or []
    avoid_block = ""
    if used_titles:
        sample = used_titles[-30:]  # last 30 to avoid bloating context
        avoid_block = (
            "\nDo NOT repeat or paraphrase any of these questions you have already "
            "written this session:\n" + "\n".join(f"  - {t[:80]}" for t in sample) + "\n"
        )

    return (
        f"Write {count} quiz questions about: \"{topic}\"\n"
        f"Difficulty: {difficulty}\n\n"
        f"For each question, provide:\n"
        f"  - question_text: clear, single-answer question (15-50 words)\n"
        f"  - answer_text: the precise answer (1-15 words, no full sentences)\n"
        f"  - funda_text: 1-2 sentences of interesting extra context\n"
        f"  - topic: pick ONE of: {', '.join(ALLOWED_TOPICS)}\n"
        f"  - difficulty: exactly \"{difficulty}\"\n\n"
        f"Difficulty calibration:\n"
        f"  - easy:   most quizzers can answer in 5 seconds\n"
        f"  - medium: requires solid GK, ~30% of regular quizzers get it\n"
        f"  - hard:   genuinely obscure, requires study, ~5-10% get it\n\n"
        f"{avoid_block}"
        f"Return STRICT JSON: an array of question objects. NO markdown fences. NO preamble. Just the JSON array."
    )


def parse_questions_json(raw):
    """Extract & validate the JSON array from LLM output."""
    if not raw: return []
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?", "", s).rstrip("`").strip()
    # Sometimes the model wraps in {"questions": [...]} — handle both
    try:
        data = json.loads(s)
    except Exception:
        # Try to extract just the array
        m = re.search(r"\[\s*\{[\s\S]*\}\s*\]", s)
        if not m: return []
        try:
            data = json.loads(m.group(0))
        except Exception:
            return []

    if isinstance(data, dict) and "questions" in data:
        data = data["questions"]
    if not isinstance(data, list): return []

    cleaned = []
    for item in data:
        if not isinstance(item, dict): continue
        qt = (item.get("question_text") or "").strip()
        at = (item.get("answer_text")   or "").strip()
        ft = (item.get("funda_text")    or "").strip()
        topic = (item.get("topic") or "general").strip().lower()
        diff  = (item.get("difficulty") or "medium").strip().lower()
        if not qt or not at: continue
        if topic not in ALLOWED_TOPICS: topic = "general"
        if diff  not in ALLOWED_DIFFICULTY: diff  = "medium"
        cleaned.append({
            "question_text": qt,
            "answer_text":   at,
            "funda_text":    ft,
            "topic":         topic,
            "difficulty":    diff,
            "question_image_path": None,
            "answer_image_path":   None,
            "funda_image_path":    None,
        })
    return cleaned


# ── Main ───────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--topic", required=True, help="Topic / theme for the questions")
    ap.add_argument("--count", type=int, default=10, help="Number of questions (default 10)")
    ap.add_argument("--difficulty", default="medium",
                    choices=ALLOWED_DIFFICULTY, help="easy / medium / hard")
    ap.add_argument("--batch-size", type=int, default=10, help="Questions per LLM call")
    ap.add_argument("--out", help="Output JSON path (default: auto-named)")
    ap.add_argument("--apply", action="store_true",
                    help="After generation, auto-pipe to questions_updater.py (via the quality gate)")
    ap.add_argument("--dry-run", action="store_true", help="Print, don't save")
    args = ap.parse_args()

    cfg = load_config()
    token = (cfg.get("github_models_token") or "").strip()
    if not token:
        print("ERROR: github_models_token missing from config.json"); sys.exit(1)

    site = cfg.get("site_folder", "").strip()
    if not args.out:
        stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_topic = re.sub(r"[^a-zA-Z0-9]+", "_", args.topic).strip("_").lower()[:30]
        args.out = os.path.join(SCRIPT_DIR, "..", "data",
                                f"generated_{safe_topic}_{stamp}.json")
        os.makedirs(os.path.dirname(args.out), exist_ok=True)

    print(f"Topic:      {args.topic}")
    print(f"Count:      {args.count}")
    print(f"Difficulty: {args.difficulty}")
    print(f"Batch size: {args.batch_size}")
    print(f"Output:     {args.out}")
    print()

    all_questions = []
    used_titles = []
    needed = args.count

    while needed > 0:
        batch_n = min(args.batch_size, needed)
        print(f"Generating batch of {batch_n}... ({len(all_questions)}/{args.count} so far)",
              flush=True)
        prompt = build_prompt(args.topic, batch_n, args.difficulty, used_titles)

        try:
            raw = call_llm(token, prompt)
        except urllib.error.HTTPError as e:
            err_body = e.read()[:200].decode("utf-8", errors="replace")
            print(f"  HTTP {e.code}: {err_body}", flush=True)
            break
        except Exception as e:
            print(f"  ERROR: {e}", flush=True)
            break

        batch = parse_questions_json(raw)
        if not batch:
            print(f"  Got invalid JSON. Sample: {raw[:200]}", flush=True)
            needed -= 1   # avoid infinite loop on persistently bad responses
            continue

        all_questions.extend(batch)
        used_titles.extend(q["question_text"][:80] for q in batch)
        needed -= len(batch)
        time.sleep(0.8)  # polite

    print(f"\nGenerated {len(all_questions)} questions total.")

    if args.dry_run:
        print("\n--- DRY RUN — first 3 ---")
        for q in all_questions[:3]:
            print(f"  Q: {q['question_text']}")
            print(f"  A: {q['answer_text']}")
            print(f"  F: {q['funda_text']}")
            print()
        return

    payload = {
        "title":      f"AI-generated: {args.topic}",
        "questions":  all_questions,
        "generated_at": datetime.datetime.now().isoformat(),
        "meta": {
            "topic":      args.topic,
            "difficulty": args.difficulty,
            "model":      MODEL,
        },
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Saved to {args.out}")

    if args.apply:
        print("\nPiping into questions_updater.py (gate-routed)...")
        rc = subprocess.run(
            [sys.executable, os.path.join(SCRIPT_DIR, "questions_updater.py"), args.out],
            cwd=ROOT_DIR)
        if rc.returncode != 0:
            print("Updater exited non-zero. Check pending queue.")


if __name__ == "__main__":
    main()
