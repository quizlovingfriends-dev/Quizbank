"""
apply_image_mapping.py — Apply an image_mapping.json (exported from
image-picker.html) to data/questions.js.

The mapping shape is { "<qid>": "images/cirs/imageN.jpg" }.

Safe behavior:
  - Writes a timestamped .bak before mutating questions.js.
  - Surgical regex edit: finds `"id": <qid>` then the next `"image": null`
    after it and replaces that single null with the path. No JSON round-trip.
  - Re-parses + validates question count after writing; auto-rollback on failure.

Usage:
  python scripts/apply_image_mapping.py <mapping.json>
"""
import argparse
import json
import os
import re
import shutil
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
CONFIG     = os.path.join(ROOT_DIR, "config.json")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mapping_json")
    args = ap.parse_args()

    with open(CONFIG, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    site = cfg.get("site_folder", "").strip()
    if not site:
        print("ERROR: site_folder not set in config.json", file=sys.stderr); sys.exit(1)

    qs_path = os.path.join(site, "data", "questions.js")
    if not os.path.isfile(qs_path):
        print(f"ERROR: questions.js not found at {qs_path}", file=sys.stderr); sys.exit(1)

    with open(args.mapping_json, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    if not isinstance(mapping, dict):
        print("ERROR: mapping JSON must be an object", file=sys.stderr); sys.exit(1)

    print(f"Mapping has {len(mapping)} assignments")

    # Backup
    stamp = time.strftime("%Y%m%d_%H%M%S")
    backup = qs_path + f".imgmap_{stamp}.bak"
    shutil.copy2(qs_path, backup)
    print(f"Backup: {backup}")

    with open(qs_path, "r", encoding="utf-8") as f:
        text = f.read()

    applied = 0
    skipped_already_set = 0
    skipped_not_found  = 0

    for qid_str, image_path in mapping.items():
        try:
            qid = int(qid_str)
        except ValueError:
            continue
        # Find the question block by id:<qid>, then the first image:null after it
        # Tolerate both `"id": N` (JSON) and `id: N` (JS) shapes.
        id_re = re.compile(r'\bid\s*:\s*' + str(qid) + r'\b')
        m = id_re.search(text)
        if not m:
            skipped_not_found += 1
            print(f"  q{qid}: NOT FOUND in questions.js")
            continue
        # Find next image: null after this position, but stop at next id: marker
        rest = text[m.end():]
        next_id = re.search(r'\bid\s*:\s*\d+', rest)
        scope_end = m.end() + (next_id.start() if next_id else len(rest))
        scope = text[m.end():scope_end]
        img_null_re = re.compile(r'(image\s*:\s*)(null)')
        img_match = img_null_re.search(scope)
        if not img_match:
            # Already set or other shape — try replacing existing image string
            img_str_re = re.compile(r'(image\s*:\s*)"[^"]*"')
            img_match = img_str_re.search(scope)
            if not img_match:
                skipped_not_found += 1
                print(f"  q{qid}: image field not found")
                continue
        abs_pos = m.end() + img_match.start()
        end_pos = m.end() + img_match.end()
        new_value = img_match.group(1) + '"' + image_path + '"'
        text = text[:abs_pos] + new_value + text[end_pos:]
        applied += 1

    with open(qs_path, "w", encoding="utf-8") as f:
        f.write(text)

    # Validate
    try:
        with open(qs_path, "r", encoding="utf-8") as f:
            test = f.read()
        m = re.search(r"const\s+QUIZ_QUESTIONS\s*=\s*(\[.*?\])\s*;?\s*$", test, re.DOTALL)
        if not m:
            raise RuntimeError("Cannot find QUIZ_QUESTIONS array after edit")
        data = json.loads(m.group(1))
        if not isinstance(data, list) or len(data) == 0:
            raise RuntimeError("Parsed array is empty or wrong shape")
        print(f"VALIDATION OK — {len(data)} questions parse cleanly")
    except Exception as e:
        print(f"VALIDATION FAILED: {e}", file=sys.stderr)
        print("Restoring from backup.", file=sys.stderr)
        shutil.copy2(backup, qs_path)
        sys.exit(2)

    print()
    print(f"DONE.  applied: {applied}  skipped: {skipped_not_found}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
