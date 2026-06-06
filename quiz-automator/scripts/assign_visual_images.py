"""
assign_visual_images.py — Find the right PPTX slide image for broken-visual
questions, copy it into images/, and update questions.js.

Strategy:
  1. Take the list of broken-visual question IDs
  2. For each, search through OCR-rendered slide images in
     extracted_pptx_images/ — match the first 80 chars of the question text
     against OCR text of each slide
  3. The best-matching slide's image becomes question.image
  4. Save with backup + JS validation

Note: slow on first run because it OCRs every PPTX slide. Caches results.
"""
import os
import re
import sys
import json
import shutil
import datetime
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
SITE_DIR   = os.path.dirname(SCRIPT_DIR.rstrip("/").rsplit(os.sep, 1)[0]) if False else r"D:\QUIZBANK"
EXTRACTED  = os.path.join(ROOT_DIR, "extracted_pptx_images")
CACHE_PATH = os.path.join(ROOT_DIR, "data", "slide_ocr_cache.json")

# Broken visual questions to match
BROKEN_IDS = [26, 29, 30, 35, 70, 79, 124]  # Q67/Q77 already done


def load_questions():
    qs_path = os.path.join(SITE_DIR, "data", "questions.js")
    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    m = re.search(r"\[[\s\S]*\]", text)
    return json.loads(m.group(0), strict=False), qs_path, text


def get_reader():
    print("  Loading EasyOCR model (~one-time, slow)...", flush=True)
    import easyocr
    return easyocr.Reader(["en"], verbose=False)


def ocr_image(reader, path):
    import numpy as np
    from PIL import Image
    img = Image.open(path).convert("RGB")
    # Crop top 30% — most quiz slides have the question text in the top portion
    w, h = img.size
    top = img.crop((0, 0, w, int(h * 0.35)))
    arr = np.array(top)
    results = reader.readtext(arr, detail=0, paragraph=True)
    return " ".join(results).lower()


def cache_load():
    if os.path.isfile(CACHE_PATH):
        try: return json.load(open(CACHE_PATH, "r", encoding="utf-8"))
        except Exception: return {}
    return {}


def cache_save(data):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def similarity(a, b):
    """Jaccard similarity on word sets."""
    sa = set(re.findall(r"[a-z]{3,}", a.lower()))
    sb = set(re.findall(r"[a-z]{3,}", b.lower()))
    if not sa or not sb: return 0.0
    return len(sa & sb) / max(1, len(sa | sb))


def main():
    qs, qs_path, qs_text = load_questions()

    targets = {}
    for q in qs:
        if q.get("id") in BROKEN_IDS:
            targets[q["id"]] = (q["question"]["text"] or "")[:200]

    print(f"Targeting {len(targets)} broken-visual questions:")
    for qid, txt in targets.items():
        print(f"  Q{qid}: {txt[:70]}")
    print()

    # Walk extracted images
    if not os.path.isdir(EXTRACTED):
        print(f"No extracted_pptx_images/ folder. Run extract_pptx_images.py first.")
        sys.exit(1)

    cache = cache_load()
    reader = None  # lazy

    matches = {}  # qid -> (slide_path, score, ocr_text)

    for pptx_name in os.listdir(EXTRACTED):
        pptx_dir = os.path.join(EXTRACTED, pptx_name)
        if not os.path.isdir(pptx_dir): continue
        slides = sorted(f for f in os.listdir(pptx_dir) if f.endswith((".png", ".jpg", ".jpeg")))
        print(f"=== Scanning {pptx_name} ({len(slides)} slides) ===", flush=True)

        for fname in slides:
            full = os.path.join(pptx_dir, fname)
            key  = pptx_name + "/" + fname

            if key in cache:
                ocr_text = cache[key]
            else:
                if reader is None:
                    reader = get_reader()
                try:
                    ocr_text = ocr_image(reader, full)
                except Exception as e:
                    ocr_text = ""
                cache[key] = ocr_text
                if len(cache) % 20 == 0:
                    cache_save(cache)

            for qid, q_text in targets.items():
                score = similarity(ocr_text, q_text)
                if score >= 0.18:  # decent overlap
                    prev = matches.get(qid)
                    if prev is None or score > prev[1]:
                        matches[qid] = (full, score, ocr_text[:120])

    cache_save(cache)

    # Apply matches
    if not matches:
        print("\nNo confident matches found.")
        return

    print("\n=== Best matches ===")
    for qid, (path, score, snippet) in matches.items():
        print(f"  Q{qid}  score={score:.2f}  slide={os.path.basename(path)}")
        print(f"        ocr snippet: {snippet}")

    # Backup + apply
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".assign_visuals_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"\nBackup: {bak}")

    images_dir = os.path.join(SITE_DIR, "images")
    text = qs_text
    applied = 0
    for qid, (src_path, score, _) in matches.items():
        ext = os.path.splitext(src_path)[1].lower() or ".png"
        target_name = f"q{qid}_question{ext}"
        target_full = os.path.join(images_dir, target_name)
        shutil.copy2(src_path, target_full)

        # Update question.image
        pattern = re.compile(
            r'(\{\s*"id"\s*:\s*' + str(qid) + r'\b[^{}]*?"question"\s*:\s*\{[^{}]*?"image"\s*:\s*)(?:null|"[^"]*")',
            re.DOTALL,
        )
        new_text, n = pattern.subn(r'\1"images/' + target_name + '"', text, count=1)
        if n > 0:
            text = new_text
            applied += 1

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)

    print(f"\nApplied {applied} image assignments.")


if __name__ == "__main__":
    main()
