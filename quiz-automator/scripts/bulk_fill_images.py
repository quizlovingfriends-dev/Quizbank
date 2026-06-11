"""
bulk_fill_images.py — Find every question without an image and fetch one from Pexels.

For each question without question.image:
  1. Build a search query from "<answer_text> <topic>" (the answer makes the
     best search because it's the actual subject; topic disambiguates).
  2. Call Pexels search API for landscape image.
  3. Download top result to images/q<id>_pexels.jpg.
  4. Update questions.js to point question.image at it.

Safety:
  - Writes a timestamped backup before mutating questions.js.
  - Validates Node.js can parse the file before keeping the write.
  - Skips questions where the answer is empty or shorter than 3 chars.
  - Sleeps between API calls to stay under Pexels' 200 req/hr free-tier limit.
  - --dry-run: print what would be done, no writes.
  - --limit N: only process N questions (for testing).

Usage:
    python scripts/bulk_fill_images.py            # full run
    python scripts/bulk_fill_images.py --dry-run
    python scripts/bulk_fill_images.py --limit 10
"""
import os
import sys
import re
import json
import time
import argparse
import urllib.request
import urllib.parse
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
CONFIG     = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_questions_js(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.search(r"const\s+QUIZ_QUESTIONS\s*=\s*(\[.*?\])\s*;?\s*$", text, re.DOTALL)
    if not m:
        raise RuntimeError("Could not find QUIZ_QUESTIONS in " + path)
    return json.loads(m.group(1)), text


def write_questions_js(path, data):
    body = json.dumps(data, ensure_ascii=False, indent=2)
    out = "const QUIZ_QUESTIONS = " + body + ";\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)


def node_validate(path):
    """Re-parse the file to make sure it round-trips. Pure-Python, no Node dependency."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.search(r"const\s+QUIZ_QUESTIONS\s*=\s*(\[.*?\])\s*;?\s*$", text, re.DOTALL)
        if not m:
            return False, "QUIZ_QUESTIONS declaration not found"
        data = json.loads(m.group(1))
        if not isinstance(data, list):
            return False, "not a list"
        if len(data) == 0:
            return False, "empty list"
        return True, f"ok, {len(data)} questions"
    except Exception as e:
        return False, str(e)


def search_pexels(api_key, query):
    encoded = urllib.parse.quote(query)
    url = f"https://api.pexels.com/v1/search?query={encoded}&per_page=1&orientation=landscape"
    req = urllib.request.Request(url, headers={
        "Authorization": api_key,
        "User-Agent": "QuizVault/1.0"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
        photos = data.get("photos", [])
        if not photos:
            return None
        return photos[0]["src"]["large"]  # ~940px wide
    except Exception as e:
        print(f"  [pexels-error] {e}", file=sys.stderr)
        return None


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "QuizVault/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        with open(dest, "wb") as f:
            f.write(r.read())


_STOP = {
    "the","a","an","of","in","on","at","to","for","and","or","is","was","were","are",
    "by","from","with","as","that","this","these","those","its","his","her","their",
    "strong","em","br","p","span","div","b","i"
}


def build_query(q):
    """Best Pexels query — pull strongest nouns from the answer."""
    ans = (q.get("answer", {}) or {}).get("text", "") or ""
    topic = q.get("topic", "") or ""
    # Strip HTML tags first
    ans = re.sub(r"<[^>]+>", " ", ans)
    # Strip punctuation
    ans = re.sub(r"[^\w\s]", " ", ans).strip()
    # Drop stopwords and short tokens
    words = [w for w in ans.split() if w.lower() not in _STOP and len(w) >= 2]
    if not words:
        return None
    base = " ".join(words[:4])
    if topic and topic not in ("general", "current-affairs"):
        return base + " " + topic
    return base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print plan, no changes")
    ap.add_argument("--limit", type=int, default=0, help="process at most N questions")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between API calls")
    args = ap.parse_args()

    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    if not site:
        print("ERROR: site_folder not set in config.json", file=sys.stderr)
        sys.exit(1)
    api_key = cfg.get("pexels_api_key", "").strip()
    if not api_key:
        print("ERROR: pexels_api_key not set in config.json", file=sys.stderr)
        sys.exit(1)

    qs_path = os.path.join(site, "data", "questions.js")
    images_dir = os.path.join(site, "images")
    os.makedirs(images_dir, exist_ok=True)

    data, _ = parse_questions_js(qs_path)
    missing = [q for q in data if not ((q.get("question", {}) or {}).get("image"))]
    print(f"Total: {len(data)}   missing image: {len(missing)}")

    if args.limit > 0:
        missing = missing[:args.limit]
        print(f"Limiting to first {args.limit}")

    if args.dry_run:
        for q in missing[:10]:
            print(f"  Q{q['id']:3d} [{q.get('topic')}]  query='{build_query(q)}'")
        if len(missing) > 10:
            print(f"  ... and {len(missing) - 10} more")
        return

    # Backup
    stamp = time.strftime("%Y%m%d_%H%M%S")
    backup = qs_path + f".bulkfill_{stamp}.bak"
    with open(qs_path, "r", encoding="utf-8") as f, open(backup, "w", encoding="utf-8") as g:
        g.write(f.read())
    print(f"Backup: {backup}")

    # Build a lookup so we can mutate in-place
    by_id = {q["id"]: q for q in data if "id" in q}

    filled = 0
    skipped_no_query = 0
    skipped_no_result = 0
    errors = 0

    for i, q in enumerate(missing, 1):
        if "id" not in q:
            continue
        qid = q["id"]
        query = build_query(q)
        if not query:
            skipped_no_query += 1
            continue

        prefix = f"[{i:3d}/{len(missing)}] Q{qid:3d}"
        try:
            url = search_pexels(api_key, query)
            if not url:
                print(f"{prefix} no result for '{query}'")
                skipped_no_result += 1
                continue

            filename = f"q{qid}_pexels.jpg"
            dest = os.path.join(images_dir, filename)
            download(url, dest)

            rel = f"images/{filename}"
            by_id[qid].setdefault("question", {})["image"] = rel
            filled += 1
            print(f"{prefix} ok  '{query[:40]}' -> {rel}")

            # Save every 10 to limit damage on crash
            if filled % 10 == 0:
                write_questions_js(qs_path, data)
                ok, msg = node_validate(qs_path)
                if not ok:
                    print(f"  [VALIDATION FAILED] reverting from backup: {msg}", file=sys.stderr)
                    with open(backup, "r", encoding="utf-8") as f, open(qs_path, "w", encoding="utf-8") as g:
                        g.write(f.read())
                    sys.exit(2)
        except Exception as e:
            errors += 1
            print(f"{prefix} ERROR: {e}", file=sys.stderr)

        time.sleep(args.delay)

    # Final write
    write_questions_js(qs_path, data)
    ok, msg = node_validate(qs_path)
    if not ok:
        print(f"FINAL VALIDATION FAILED: {msg}", file=sys.stderr)
        print("Reverting from backup.", file=sys.stderr)
        with open(backup, "r", encoding="utf-8") as f, open(qs_path, "w", encoding="utf-8") as g:
            g.write(f.read())
        sys.exit(2)

    print()
    print(f"DONE.  filled: {filled}  no-result: {skipped_no_result}  no-query: {skipped_no_query}  errors: {errors}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
