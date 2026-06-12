"""
parse_ocr_questions.py — Walk OCR output, pair Question pages with their
following ANSWER pages, emit structured question records.

Input:  quiz-automator/data/ocr_<filename>.json  (from ocr_pdf.py)
Output: quiz-automator/data/ocr_questions.json

Pairing logic:
  Loop through pages in order. When a page does NOT start with "ANSWER",
  treat it as a Question page. Search forward up to N pages for the next
  page whose text starts with "ANSWER" — that's the answer. Pages between
  ("Answer can be found on the next slide" / "SOMEONE FAMOUS" / etc.) are
  considered transitional and skipped.
"""
import argparse
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
DATA_DIR   = os.path.join(ROOT_DIR, "data")


def is_transition(text):
    t = (text or '').strip().upper()
    if len(t) < 80 and ('ANSWER CAN BE FOUND' in t or 'NEXT SLIDE' in t or 'SOMEONE FAMOUS' in t):
        return True
    return False

def is_answer(text):
    t = (text or '').strip().upper()
    return t.startswith('ANSWER')

def is_chrome(text):
    """Cover slides, dividers, instructions etc. — too short or no narrative."""
    t = (text or '').strip()
    if len(t) < 30: return True
    # Slide-deck chrome
    chrome_markers = ['PRELIMS', 'QUIZ 2021', 'FINALS', 'NEGATIVE MARKING', 'NO POINTS', 'TIE BREAK', 'MANIFESTO']
    upper = t.upper()
    if any(m in upper[:80] for m in chrome_markers) and len(t) < 200:
        return True
    return False


def clean_text(s):
    s = (s or '').strip()
    # Strip "ANSWER" prefix
    s = re.sub(r'^ANSWER\s*[\n:]*', '', s, flags=re.I)
    # Collapse whitespace but keep paragraph breaks
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\n+', '\n', s).strip()
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ocr_json", help="OCR JSON file from ocr_pdf.py")
    ap.add_argument("--out", default=None)
    ap.add_argument("--start-id", type=int, default=3000, help="ID to start new questions at")
    args = ap.parse_args()

    if not os.path.isfile(args.ocr_json):
        print(f"ERROR: not found: {args.ocr_json}", file=sys.stderr); sys.exit(1)

    raw = json.load(open(args.ocr_json, "r", encoding="utf-8"))
    pages = sorted(raw.values(), key=lambda x: x['page'])

    out_path = args.out or os.path.join(DATA_DIR, "ocr_questions.json")

    questions = []
    next_id = args.start_id
    i = 0
    n = len(pages)
    while i < n:
        p = pages[i]
        text = p.get('text', '').strip()
        if not text or is_chrome(text) or is_transition(text) or is_answer(text):
            i += 1; continue

        # Found a question candidate. Find next ANSWER page within 5 pages
        ans_page = None
        for j in range(i + 1, min(i + 6, n)):
            if is_answer(pages[j].get('text', '')):
                ans_page = pages[j]; break

        if ans_page:
            questions.append({
                "id": next_id,
                "topic": "general",
                "difficulty": "medium",
                "type": "standard",
                "source_page_question": p['page'],
                "source_page_answer":   ans_page['page'],
                "question": { "text": clean_text(text), "image": None },
                "answer":   { "text": clean_text(ans_page.get('text', '')), "image": None },
                "funda":    { "text": "", "image": None },
                "_needs_review": True
            })
            next_id += 1
            i = j + 1  # skip past answer page
        else:
            i += 1

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(questions)} questions from {n} OCR'd pages")
    print(f"  -> {out_path}")
    print()
    print("Next steps:")
    print("  1. Review questions.json — fix OCR errors, set topics + difficulty")
    print("  2. Optional: pipe through quality_gate.py to score")
    print("  3. Append to data/questions.js (set _needs_review=false on approve)")


if __name__ == "__main__":
    main()
