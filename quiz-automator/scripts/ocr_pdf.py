"""
ocr_pdf.py — OCR every page of the OG quizbank PDF and save text to JSON.

Two-stage:
  1. Render each page of the PDF to a 200-DPI PNG (PyMuPDF/fitz)
  2. Run EasyOCR on each page → list of detected text snippets

Output:
  quiz-automator/data/ocr_pdf.json  — { "<filename>": [ {page, text, blocks[]} ] }
  Per-page text saved as <pdf_dir>/.ocr/page_NNN.txt for spot-checking.

Usage:
  python scripts/ocr_pdf.py <pdf_path>          # full PDF
  python scripts/ocr_pdf.py <pdf_path> --pages 1-20
  python scripts/ocr_pdf.py <pdf_path> --resume   # skip pages already done
"""
import argparse
import json
import os
import sys
import time
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
DATA_DIR   = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)


def parse_pages_arg(s, total):
    if not s: return list(range(1, total + 1))
    out = set()
    for part in s.split(','):
        if '-' in part:
            a, b = part.split('-', 1); out.update(range(int(a), int(b) + 1))
        else:
            out.add(int(part))
    return sorted(p for p in out if 1 <= p <= total)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", help="Path to PDF")
    ap.add_argument("--pages", help="Page range like 1-20 or 1,5,7", default=None)
    ap.add_argument("--resume", action="store_true", help="skip pages with existing per-page txt")
    ap.add_argument("--dpi", type=int, default=200, help="Render DPI (lower=faster, less accurate)")
    args = ap.parse_args()

    if not os.path.isfile(args.pdf):
        print(f"ERROR: PDF not found: {args.pdf}", file=sys.stderr); sys.exit(1)

    # Lazy imports — EasyOCR is heavy
    print(f"[{time.strftime('%H:%M:%S')}] Loading PyMuPDF...")
    import fitz

    print(f"[{time.strftime('%H:%M:%S')}] Loading EasyOCR (downloads models on first run)...")
    import easyocr
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    print(f"[{time.strftime('%H:%M:%S')}] EasyOCR ready.")

    doc = fitz.open(args.pdf)
    total = len(doc)
    pages = parse_pages_arg(args.pages, total)
    print(f"[{time.strftime('%H:%M:%S')}] PDF: {args.pdf}  total pages: {total}  processing: {len(pages)}")

    pdf_basename = os.path.splitext(os.path.basename(args.pdf))[0]
    out_dir = os.path.join(os.path.dirname(args.pdf), '.ocr_' + pdf_basename)
    os.makedirs(out_dir, exist_ok=True)
    json_out = os.path.join(DATA_DIR, f"ocr_{pdf_basename}.json")

    # Load existing results if resuming
    results = {}
    if args.resume and os.path.isfile(json_out):
        try:
            results = json.load(open(json_out, "r", encoding="utf-8"))
            print(f"[resume] loaded {len(results)} prior pages")
        except Exception:
            results = {}

    pages_done = 0
    t0 = time.time()
    for i, pageno in enumerate(pages, 1):
        page_key = f"p{pageno:04d}"
        per_page_txt = os.path.join(out_dir, f"page_{pageno:04d}.txt")

        if args.resume and page_key in results and os.path.isfile(per_page_txt):
            continue

        # Render → PNG bytes
        page = doc[pageno - 1]
        zoom = args.dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        png_bytes = pix.tobytes("png")

        # OCR
        ts = time.time()
        try:
            ocr_result = reader.readtext(png_bytes, detail=1, paragraph=False)
        except Exception as e:
            print(f"  p{pageno}: OCR error: {e}", file=sys.stderr)
            continue
        elapsed = time.time() - ts

        blocks = []
        for det in ocr_result:
            bbox, text, conf = det
            blocks.append({
                "text": text,
                "conf": float(conf),
                "bbox": [[float(x), float(y)] for x, y in bbox]
            })
        page_text = "\n".join(b["text"] for b in blocks)

        results[page_key] = {
            "page": pageno,
            "text": page_text,
            "blocks": blocks
        }

        with open(per_page_txt, "w", encoding="utf-8") as f:
            f.write(page_text)

        pages_done += 1
        elapsed_total = time.time() - t0
        rate = pages_done / max(elapsed_total, 0.001)
        eta_seconds = (len(pages) - i) / max(rate, 0.001)
        print(f"  [{i:3d}/{len(pages)}] page {pageno:3d}: {len(blocks):3d} blocks  {elapsed:4.1f}s  ETA {eta_seconds/60:.1f}min")

        # Save every 5 pages
        if pages_done % 5 == 0:
            with open(json_out, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=1)

    # Final save
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)

    print()
    print(f"DONE.  pages OCR'd: {pages_done}  total stored: {len(results)}")
    print(f"  JSON: {json_out}")
    print(f"  Per-page txt: {out_dir}/")


if __name__ == "__main__":
    main()
