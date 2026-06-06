"""
purge_pexels.py — Remove all Pexels random stock images.

The Pexels enrichment phase fetched stock photos based on keyword matches
against answer text. For abstract / proper-noun answers, Pexels returned
unrelated images (cowboys, mosques, etc). This script removes them.

Action:
  1. For every question with answer.image matching '*_pexels.jpg':
     - Set answer.image to null in questions.js
     - Delete the actual file from images/
  2. Wikipedia thumbnails (_wiki) and any other images stay untouched.
  3. Backup questions.js first. Verify file still parses as JS.
"""
import os
import re
import json
import shutil
import datetime
import subprocess

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path    = os.path.join(site, "data", "questions.js")
    images_dir = os.path.join(site, "images")

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".purge_pexels_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"Backup: {bak}")

    # Find Pexels image refs and null them out via surgical regex
    pattern = re.compile(
        r'("image"\s*:\s*)"(images/[^"]*_pexels[^"]*)"',
        re.IGNORECASE,
    )

    pexels_files = []
    def replace(m):
        pexels_files.append(m.group(2))
        return m.group(1) + 'null'

    new_text = pattern.sub(replace, text)
    refs_nulled = len(pexels_files)

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)

    # Delete the actual files
    deleted = 0
    for rel in pexels_files:
        full = os.path.join(site, rel.replace("/", os.sep))
        try:
            if os.path.isfile(full):
                os.remove(full)
                deleted += 1
        except Exception as e:
            print(f"  Failed to delete {rel}: {e}")

    # Also delete any remaining orphan _pexels files from the images dir
    extra_deleted = 0
    if os.path.isdir(images_dir):
        for f in os.listdir(images_dir):
            if "_pexels" in f.lower():
                try:
                    os.remove(os.path.join(images_dir, f))
                    extra_deleted += 1
                except Exception:
                    pass

    # Verify JS still parses
    rc = subprocess.run(
        ["node", "-e",
         "const fs=require('fs');"
         f"const text=fs.readFileSync('{qs_path.replace(chr(92), '/')}','utf8');"
         "new Function(text+'\\nreturn QUIZ_QUESTIONS;')();"
         "console.log('OK');"],
        capture_output=True, text=True,
    )
    if rc.returncode != 0:
        print("FAILED — restoring backup")
        print(rc.stderr[:500])
        shutil.copy2(bak, qs_path)
        return

    print()
    print(f"  Image refs nulled in questions.js: {refs_nulled}")
    print(f"  Files deleted (referenced):        {deleted}")
    print(f"  Files deleted (orphan _pexels):    {extra_deleted}")
    print(f"  JS verification:                   OK")


if __name__ == "__main__":
    main()
