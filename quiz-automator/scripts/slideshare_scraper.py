"""
slideshare_scraper.py — Download slides from a Slideshare URL and run the quiz extractor on them.

Usage:
    python scripts/slideshare_scraper.py <slideshare_url>

What it does:
    1. Fetches the Slideshare page to find all slide image URLs
    2. Downloads every slide as a high-res JPEG
    3. Runs OCR on each slide (same pipeline as PPTX/PDF)
    4. Outputs extracted questions as JSON (same format as extractor.py)

Tip: pipe the output straight into questions_updater:
    python scripts/slideshare_scraper.py <url> | python scripts/questions_updater.py
"""

import sys
import os
import re
import json
import tempfile
import shutil
import urllib.request
import urllib.error

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def fetch_url(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read() if binary else r.read().decode("utf-8", errors="replace")


def get_slide_image_urls(slideshare_url):
    """
    Parse a Slideshare page and return a list of slide image URLs.
    Slideshare embeds slide images in JSON inside the page HTML.
    """
    print(f"Fetching Slideshare page...", file=sys.stderr)
    html = fetch_url(slideshare_url)

    urls = []

    # Method 1: JSON data blob in page source (most reliable)
    # Slideshare embeds slide data as: {"slideImages":[{"src":"..."},...]}
    m = re.search(r'"slideImages"\s*:\s*(\[.*?\])', html, re.DOTALL)
    if m:
        try:
            slides_json = json.loads(m.group(1))
            for slide in slides_json:
                src = slide.get("src") or slide.get("url") or ""
                if src:
                    urls.append(src)
        except Exception:
            pass

    # Method 2: Look for slide image tags directly
    if not urls:
        # Pattern: https://image.slidesharecdn.com/.../slide-N-1024.jpg
        found = re.findall(
            r'https://image\.slidesharecdn\.com/[^"\'>\s]+?(?:1024|960|800)\.(?:jpg|jpeg|png)',
            html
        )
        # De-duplicate preserving order
        seen = set()
        for u in found:
            if u not in seen:
                seen.add(u)
                urls.append(u)

    # Method 3: Look for any slidesharecdn image URLs
    if not urls:
        found = re.findall(
            r'https://image\.slidesharecdn\.com/[^"\'>\s]+?\.(?:jpg|jpeg|png)',
            html
        )
        seen = set()
        for u in found:
            if u not in seen:
                seen.add(u)
                urls.append(u)

    if not urls:
        raise RuntimeError(
            "Could not find slide images in Slideshare page.\n"
            "Make sure the URL is a public Slideshare presentation (not a private one).\n"
            f"URL tried: {slideshare_url}"
        )

    # Try to get highest resolution by replacing size suffix
    hi_res = []
    for u in urls:
        # Replace common size suffixes with 1280 for best quality
        u_hi = re.sub(r'[-_](96|128|170|320|638|800|960|1024)(\.jpg)', r'-1280\2', u)
        hi_res.append(u_hi)

    print(f"Found {len(hi_res)} slides.", file=sys.stderr)
    return hi_res


def download_slides(urls, temp_dir):
    """Download all slide images. Returns list of local file paths."""
    paths = []
    total = len(urls)
    for i, url in enumerate(urls):
        out = os.path.join(temp_dir, f"slide_{i:04d}.jpg")
        try:
            data = fetch_url(url, binary=True)
            with open(out, "wb") as f:
                f.write(data)
            paths.append(out)
        except urllib.error.HTTPError:
            # Hi-res version doesn't exist — try original URL
            orig = urls[i]  # original URL before size upgrade
            try:
                data = fetch_url(orig, binary=True)
                with open(out, "wb") as f:
                    f.write(data)
                paths.append(out)
            except Exception:
                paths.append(None)
        except Exception:
            paths.append(None)

        if (i + 1) % 20 == 0 or i == total - 1:
            print(f"  Downloaded {i+1}/{total} slides...", file=sys.stderr)

    return paths


def extract_title_from_url(url):
    """Best-effort title from Slideshare URL."""
    # e.g. https://www.slideshare.net/username/my-quiz-title
    parts = url.rstrip("/").split("/")
    if len(parts) >= 2:
        return parts[-1].replace("-", " ").title()
    return "Slideshare Quiz"


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/slideshare_scraper.py <slideshare_url>", file=sys.stderr)
        print("Example: python scripts/slideshare_scraper.py https://www.slideshare.net/user/my-quiz", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1].strip()
    if "slideshare.net" not in url:
        print(f"Warning: URL doesn't look like a Slideshare link: {url}", file=sys.stderr)

    try:
        config = load_config()
    except Exception as e:
        print(f"Failed to load config.json: {e}", file=sys.stderr)
        sys.exit(1)

    temp_dir = tempfile.mkdtemp(prefix="quiz_ss_")

    try:
        # Step 1 — get slide URLs
        slide_urls = get_slide_image_urls(url)

        # Step 2 — download slides
        print("Downloading slides...", file=sys.stderr)
        slide_paths = download_slides(slide_urls, temp_dir)
        downloaded = sum(1 for p in slide_paths if p)
        print(f"Downloaded {downloaded}/{len(slide_paths)} slides.", file=sys.stderr)

        if downloaded == 0:
            raise RuntimeError("No slides could be downloaded.")

        # Step 3 — OCR using the same pipeline as PPTX/PDF
        sys.path.insert(0, SCRIPT_DIR)
        from ocr_extractor import (
            ocr_image, ocr_answer_slide, ocr_question_slide,
            is_answer_slide, is_junk_slide,
            clean_question_text, smart_answer_line, detect_topic
        )

        total = len(slide_paths)
        print(f"OCR scanning {total} slides...", file=sys.stderr)

        # First pass: full OCR to classify
        slide_texts = []
        for idx, path in enumerate(slide_paths):
            if path is None:
                slide_texts.append("")
                continue
            if idx % 20 == 0:
                print(f"  Pass 1 — Slide {idx+1}/{total}...", file=sys.stderr)
            try:
                slide_texts.append(ocr_image(path))
            except Exception:
                slide_texts.append("")

        answer_indices = {i for i, t in enumerate(slide_texts) if is_answer_slide(t)}
        print(f"Found {len(answer_indices)} answer slides.", file=sys.stderr)

        # Second pass: region OCR on Q+A pairs
        questions = []
        for ans_idx in sorted(answer_indices):
            q_idx = ans_idx - 1
            if q_idx < 0 or q_idx in answer_indices:
                continue
            if not slide_paths[q_idx] or not slide_paths[ans_idx]:
                continue

            print(f"  Pass 2 — Q{q_idx+1}/A{ans_idx+1}...", file=sys.stderr)

            try:
                q_text = ocr_question_slide(slide_paths[q_idx])
            except Exception:
                q_text = clean_question_text(slide_texts[q_idx])

            try:
                a_text = ocr_answer_slide(slide_paths[ans_idx])
            except Exception:
                a_text = smart_answer_line(slide_texts[ans_idx])

            if not q_text or is_junk_slide(q_text):
                continue

            topic = detect_topic(q_text, a_text, config.get("topic_keywords", {}))
            questions.append({
                "question_text":       q_text,
                "answer_text":         a_text,
                "funda_text":          "",
                "topic":               topic,
                "has_image_placeholder": False,
                "question_image_path": None,
                "answer_image_path":   slide_paths[ans_idx],  # answer slide image
            })

        title = extract_title_from_url(url)
        result = {"title": title, "questions": questions}
        print(f"Extracted {len(questions)} questions from {url}", file=sys.stderr)
        print(json.dumps(result, ensure_ascii=False, indent=2))

        # Note: temp_dir NOT deleted — questions_updater needs the answer images
        # It will be cleaned up by watcher.py or manually

    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
