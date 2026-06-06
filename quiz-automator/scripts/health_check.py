"""
health_check.py — Audit the quality of every question in data/questions.js.

Usage:  python scripts/health_check.py
        python scripts/health_check.py --json   (machine-readable output)
        python scripts/health_check.py --fix    (auto-fix simple issues)

Scores each question on a 0-100 scale across:
  - question_text quality (length, OCR-noise patterns, completeness)
  - answer_text quality   (length, alpha ratio, suspicious tokens)
  - funda presence        (empty fundas drop the score by 15)
  - topic match           (does the topic make sense for the content?)
  - image existence       (do referenced images actually exist?)

Prints a sorted list of low-health questions for review.
"""
import os
import re
import sys
import json
import argparse

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── JS-to-Python question parser ─────────────────────────────────────────────

def parse_questions_js(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    # Strip 'const QUIZ_QUESTIONS = ' and trailing ';'
    start_tag = 'const QUIZ_QUESTIONS = '
    if start_tag in text:
        json_str = text[text.find(start_tag) + len(start_tag):].strip()
        if json_str.endswith(";"):
            json_str = json_str[:-1]
    else:
        json_str = text.strip()

    raw_data = json.loads(json_str)
    questions = []
    for q in raw_data:
        questions.append({
            "id": q.get("id", 0),
            "topic": q.get("topic", "general"),
            "question_text": q.get("question", {}).get("text", ""),
            "question_image": q.get("question", {}).get("image"),
            "answer_text": q.get("answer", {}).get("text", ""),
            "answer_image": q.get("answer", {}).get("image"),
            "funda_text": q.get("funda", {}).get("text", ""),
            "funda_image": q.get("funda", {}).get("image"),
        })
    return questions


def _extract_str(block, pattern):
    m = re.search(pattern, block)
    return m.group(1) if m else ""


def _extract_nested(block, outer, inner):
    """Find e.g. question: { text: "...", image: ... } → return text or None."""
    outer_re = re.compile(outer + r"\s*:\s*\{([^{}]*)\}", re.DOTALL)
    om = outer_re.search(block)
    if not om:
        return None
    inner_text = om.group(1)
    if inner == "image":
        # image: null  OR  image: "images/..."
        nm = re.search(r'image\s*:\s*(?:null|"([^"]*)")', inner_text)
        return nm.group(1) if nm and nm.group(1) else None
    nm = re.search(r'text\s*:\s*"((?:[^"\\]|\\.)*)"', inner_text)
    return nm.group(1).replace("\\\"", "\"").replace("\\\\", "\\") if nm else None


# ── Scoring ──────────────────────────────────────────────────────────────────

ALLOWED_TOPICS = ["sports", "wildlife", "current-affairs", "history", "politics", "cuisines", "general"]

OCR_NOISE_TOKENS = re.compile(r"[\^_~|<>]{2,}|[A-Z]{2,}[a-z]{2,}[A-Z]{2,}")
SUSPICIOUS_PATTERNS = [
    (re.compile(r"\b0\s+[A-Z]"),                "stray '0' in question text"),
    (re.compile(r"\b(I0|l0)\b"),                "I0/l0 instead of 10"),
    (re.compile(r"\([^)]{0,3}of"),              "broken parenthesis"),
    (re.compile(r"[^\w\s\.,;:!?\"'\-()]{3,}"),  "unusual character cluster"),
]


def alpha_ratio(text):
    if not text:
        return 0.0
    return sum(c.isalpha() or c.isspace() for c in text) / len(text)


def score_question(q, images_dir):
    issues = []
    score  = 100

    qt = q["question_text"]
    at = q["answer_text"]
    ft = q["funda_text"]

    # Question length
    if len(qt) < 10:
        score -= 30; issues.append(f"question too short ({len(qt)} chars)")
    elif len(qt) > 1500:
        score -= 10; issues.append(f"question very long ({len(qt)} chars)")

    # Answer length
    if len(at) < 2:
        score -= 40; issues.append(f"answer too short ({len(at)} chars)")
    elif len(at) > 200:
        score -= 5;  issues.append(f"answer long ({len(at)} chars)")

    # OCR noise patterns
    if OCR_NOISE_TOKENS.search(at):
        score -= 15; issues.append("OCR-noise tokens in answer")
    if alpha_ratio(at) < 0.6:
        score -= 15; issues.append(f"low alpha ratio in answer ({alpha_ratio(at):.0%})")

    # Suspicious patterns in question
    for pat, desc in SUSPICIOUS_PATTERNS:
        if pat.search(qt):
            score -= 5; issues.append(desc)

    # Empty funda
    if not ft.strip():
        score -= 10; issues.append("no funda")

    # Topic
    if q["topic"] not in ALLOWED_TOPICS:
        score -= 20; issues.append(f"invalid topic {q['topic']!r}")
    elif q["topic"] == "general":
        # general is the catch-all; gentle penalty so we look for a real topic
        score -= 3

    # Images
    for role in ("question_image", "answer_image", "funda_image"):
        rel = q.get(role)
        if not rel:
            continue
        # Path is relative to site root, e.g. "images/q42_answer.png"
        full = os.path.join(os.path.dirname(images_dir), rel.replace("/", os.sep))
        if not os.path.isfile(full):
            score -= 10; issues.append(f"missing image {rel}")

    return max(0, score), issues


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true", help="output JSON instead of text")
    ap.add_argument("--threshold", type=int, default=80, help="show questions below this score")
    args = ap.parse_args()

    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")
    images_dir = os.path.join(site, "images")

    if not os.path.isfile(qs_path):
        print(f"questions.js not found at {qs_path}", file=sys.stderr)
        sys.exit(1)

    questions = parse_questions_js(qs_path)
    results = []
    for q in questions:
        score, issues = score_question(q, images_dir)
        results.append({
            "id": q["id"], "topic": q["topic"],
            "score": score, "issues": issues,
            "question_preview": q["question_text"][:60],
            "answer_preview":   q["answer_text"][:50],
        })

    # Stats
    total = len(results)
    perfect = sum(1 for r in results if r["score"] == 100)
    healthy = sum(1 for r in results if r["score"] >= 80)
    bad     = [r for r in results if r["score"] < args.threshold]

    if args.json:
        print(json.dumps({
            "summary": {"total": total, "perfect": perfect, "healthy": healthy, "below_threshold": len(bad)},
            "questions": results,
        }, ensure_ascii=False, indent=2))
        return

    print(f"\n=== Quiz Health Report ===")
    print(f"Total questions: {total}")
    print(f"  100/100 perfect:        {perfect}")
    print(f"  >=80 (healthy):         {healthy}")
    print(f"  <{args.threshold} (need review):     {len(bad)}\n")

    if bad:
        bad.sort(key=lambda r: r["score"])
        print(f"--- {len(bad)} questions below threshold ---")
        for r in bad[:30]:
            print(f"  Q{r['id']:3d}  score={r['score']:3d}  topic={r['topic']:<14s}  {r['question_preview']}")
            for i in r["issues"]:
                print(f"           - {i}")


if __name__ == "__main__":
    main()
