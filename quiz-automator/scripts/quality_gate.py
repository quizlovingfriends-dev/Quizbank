"""
quality_gate.py — Single source of truth for question quality scoring.

Every question entering the system runs through `score_question()`.
Above threshold → ready to go live. Below → goes to pending review queue.

Used by:
  - questions_updater.py  (auto-classifies incoming questions)
  - watcher.py            (per-file summary)
  - admin-review.html     (re-scores after manual edits)

Public API:
  classify_question(q)  → {
      "score": int,           # 0..100
      "verdict": str,         # "approved" | "pending" | "rejected"
      "issues": [str],        # list of human-readable problems
      "auto_fixes": dict      # suggestions: {"answer_text": "cleaned version", ...}
  }
"""
import os
import re
import json
import argparse

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

ALLOWED_TOPICS = {
    "sports", "wildlife", "current-affairs", "history",
    "politics", "cuisines", "science", "literature", "geography", "general",
}

# Thresholds — tweak in one place
SCORE_AUTO_APPROVE = 80    # >= this: goes live immediately
SCORE_AUTO_REJECT  = 30    # <  this: hard reject (won't even hit the review queue)
# Everything between [30, 80) → pending review

# ── Detection patterns ──────────────────────────────────────────────────────

# OCR garbage tokens (mixed-case run, no spaces, like "oxymRIC")
OCR_GARBLED = re.compile(r"\b(?:[a-z][A-Z]){3,}|[A-Z]{2,}[a-z]{2,}[A-Z]{2,}")

# Broken URLs in question text
BROKEN_URL = re.compile(r"https?://www?\.\s+\w|https?:\s*[a-z]", re.I)

# Image-placement markers leaked from source
IMAGE_MARKER = re.compile(r"\[ATTACH[^\]]*\]|\[image\]|\[picture\]|\[insert\b", re.I)

# Number-as-letter OCR substitutions
NUMBER_AS_LETTER = re.compile(r"\b(?:I0|l0|O\d)\b")

# Suspicious cluster — too many non-letter chars in a row
WEIRD_CLUSTER = re.compile(r"[^\w\s\.,;:!?\"'\-()/+%]{3,}")


def alpha_ratio(text):
    """Fraction of alphabetic/space chars in a string."""
    if not text:
        return 0.0
    return sum(c.isalpha() or c.isspace() for c in text) / len(text)


def strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "")


# ── Per-question scoring ────────────────────────────────────────────────────

def _normalize_question(q):
    """Accept both the nested shape (live questions.js) and the flat shape
    (extractor output). Returns nested form."""
    if isinstance(q.get("question"), dict):
        return q
    return {
        "id":         q.get("id"),
        "topic":      q.get("topic", "general"),
        "difficulty": q.get("difficulty", "medium"),
        "question":   {"text": q.get("question_text", ""), "image": q.get("question_image_path")},
        "answer":     {"text": q.get("answer_text", ""),   "image": q.get("answer_image_path")},
        "funda":      {"text": q.get("funda_text", ""),    "image": q.get("funda_image_path")},
    }


def score_question(q, images_dir=None):
    """
    Score a question dict. Returns (score, issues, auto_fixes).
    Accepts both nested (questions.js) and flat (extractor) shapes.
    """
    q = _normalize_question(q)
    issues = []
    auto_fixes = {}
    score = 100

    qt = strip_html((q.get("question") or {}).get("text", "") or "")
    at = strip_html((q.get("answer")   or {}).get("text", "") or "")
    ft = strip_html((q.get("funda")    or {}).get("text", "") or "")

    # ── Question text ──────────────────────────────────────────────────────
    if len(qt) < 10:
        score -= 35; issues.append(f"Question too short ({len(qt)} chars)")
    elif len(qt) > 1500:
        score -= 10; issues.append(f"Question very long ({len(qt)} chars)")

    if BROKEN_URL.search(qt):
        score -= 25
        issues.append("Broken URL fragment in question (likely OCR damage)")
        cleaned = re.sub(r"https?://\s*[\w.]+\s*", "", qt).strip()
        if cleaned: auto_fixes["question_text"] = cleaned

    if IMAGE_MARKER.search(qt):
        score -= 15
        issues.append("Image-placement marker leaked into question text")
        auto_fixes["question_text"] = IMAGE_MARKER.sub("", qt).strip()

    if NUMBER_AS_LETTER.search(qt):
        score -= 5
        issues.append("Number-as-letter OCR substitution (e.g. I0 for 10)")

    if WEIRD_CLUSTER.search(qt):
        score -= 5; issues.append("Unusual character cluster in question")

    # ── Answer text ────────────────────────────────────────────────────────
    if len(at) < 2:
        score -= 45; issues.append("Answer is empty or too short")
    elif len(at) > 250:
        score -= 5; issues.append(f"Answer long ({len(at)} chars)")

    if at and alpha_ratio(at) < 0.55:
        score -= 20
        issues.append(f"Low alpha-ratio in answer ({alpha_ratio(at):.0%}) — likely OCR garbage")

    if OCR_GARBLED.search(at):
        score -= 15
        issues.append("OCR-garbled token in answer")

    if IMAGE_MARKER.search(at):
        score -= 15
        issues.append("Image marker leaked into answer text")
        auto_fixes["answer_text"] = IMAGE_MARKER.sub("", at).strip()

    # ── Funda ──────────────────────────────────────────────────────────────
    if not ft.strip():
        score -= 8; issues.append("No funda")
    elif len(ft) < 30:
        score -= 5; issues.append("Funda is suspiciously short")

    # ── Topic ──────────────────────────────────────────────────────────────
    topic = q.get("topic") or "general"
    if topic not in ALLOWED_TOPICS:
        score -= 20
        issues.append(f"Invalid topic: {topic!r}")
    elif topic == "general":
        score -= 3   # mild penalty — we prefer specific topics

    # ── Images ─────────────────────────────────────────────────────────────
    if images_dir:
        for role in ("question", "answer", "funda"):
            img = ((q.get(role) or {}).get("image"))
            if not img: continue
            if not isinstance(img, str): continue
            local_path = os.path.join(os.path.dirname(images_dir), img.replace("/", os.sep))
            if not os.path.isfile(local_path):
                score -= 8
                issues.append(f"Referenced {role} image not found: {img}")

    return max(0, score), issues, auto_fixes


# ── Verdict (single decision point) ────────────────────────────────────────

def classify_question(q, images_dir=None, source=None):
    """Top-level helper used by every other script.

    `source` controls the trust level. AI-generated and community-submitted
    questions ALWAYS go to pending review, even with a perfect score —
    because they need human eyeballs on factual accuracy.
    Only "watcher" (i.e. extracted from your curated PPTX/PDF) can auto-approve.
    """
    score, issues, auto_fixes = score_question(q, images_dir)

    UNTRUSTED_SOURCES = {"ai", "community", "manual"}

    if score < SCORE_AUTO_REJECT:
        verdict = "rejected"
    elif source in UNTRUSTED_SOURCES:
        # Force human review on anything not from your trusted source
        verdict = "pending"
        issues.append(f"Source '{source}' — always goes to review (not auto-approve)")
    elif score >= SCORE_AUTO_APPROVE:
        verdict = "approved"
    else:
        verdict = "pending"

    return {
        "score":      score,
        "verdict":    verdict,
        "issues":     issues,
        "auto_fixes": auto_fixes,
        "source":     source or "unknown",
    }


# ── CLI: classify questions in a JSON file or stdin ────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", help="JSON file with array of question objects to classify")
    ap.add_argument("--threshold", type=int, default=SCORE_AUTO_APPROVE,
                    help="Override approval threshold")
    args = ap.parse_args()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        import sys
        data = json.loads(sys.stdin.read())

    if isinstance(data, dict) and "questions" in data:
        data = data["questions"]

    counts = {"approved": 0, "pending": 0, "rejected": 0}
    pending = []

    for q in data:
        result = classify_question(q)
        counts[result["verdict"]] += 1
        if result["verdict"] == "pending":
            pending.append({
                "id":         q.get("id"),
                "topic":      q.get("topic"),
                "score":      result["score"],
                "issues":     result["issues"],
                "question_preview": (q.get("question") or {}).get("text", "")[:80],
            })

    print(json.dumps({
        "total":   len(data),
        "counts":  counts,
        "pending_sample": pending[:10],
        "thresholds": {
            "auto_approve": SCORE_AUTO_APPROVE,
            "auto_reject":  SCORE_AUTO_REJECT,
        },
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
