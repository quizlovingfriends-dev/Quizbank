"""
deploy.py — Single-command deploy helper for QuizVault.

Uses an ALLOW-LIST: only specific files / folders are zipped.
Anything else (debug logs, dev tools, Git install, OCR caches) is ignored.

Workflow:
  1. Smoke test (abort on failure)
  2. Health check (informational)
  3. Build a clean zip from the allow-list
  4. Open Explorer + Netlify Drop

Usage:  python scripts/deploy.py
"""
import os
import sys
import json
import shutil
import zipfile
import datetime
import subprocess
import webbrowser

try:
    import csscompressor
    import jsmin
except ImportError:
    csscompressor = None
    jsmin = None

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def step(msg):
    print()
    print("=" * 60)
    print("  " + msg)
    print("=" * 60)


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    return result.returncode, (result.stdout or "") + (result.stderr or "")


# ── ALLOW LIST ───────────────────────────────────────────────────────────────
# Only these top-level paths get included.

ALLOWED_TOP_FILES = {
    "index.html", "questionbank.html", "wiki.html", "analytics.html",
    "404.html", "_redirects", "robots.txt", "sitemap.xml",
}

ALLOWED_TOP_DIRS = {"css", "js", "data", "images", "fonts"}

# Inside allowed dirs, skip these extensions/files
EXCLUDE_EXT_IN_DEPLOY = {".bak", ".bak2", ".log", ".tmp", ".py", ".pyc"}
EXCLUDE_FILENAME_PATTERNS = (".pre_", ".fix_", ".enrich_", ".github_",
                              ".pollinations_", ".bak.", ".old.")


def is_deploy_file(rel_path, referenced_images=None):
    """True if this relative path should be included in the deploy zip."""
    rel = rel_path.replace("\\", "/")
    parts = rel.split("/")
    top = parts[0]

    if len(parts) == 1:
        return top in ALLOWED_TOP_FILES

    if top not in ALLOWED_TOP_DIRS:
        return False

    fname = parts[-1]
    ext = os.path.splitext(fname)[1].lower()
    if ext in EXCLUDE_EXT_IN_DEPLOY:
        return False
    for pat in EXCLUDE_FILENAME_PATTERNS:
        if pat in fname:
            return False
    if fname.startswith("."):
        return False

    # Images: only include if referenced in questions.js
    if top == "images" and referenced_images is not None:
        if rel not in referenced_images:
            return False

    return True


def find_referenced_images(site):
    """Scan data/questions.js for all 'images/...' paths it references."""
    qs_path = os.path.join(site, "data", "questions.js")
    if not os.path.isfile(qs_path):
        return set()
    import re
    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    return set(re.findall(r'"(images/[^"]+)"', text))


def main():
    cfg  = load_config()
    site = cfg.get("site_folder", "").strip()
    if not site or not os.path.isdir(site):
        print(f"ERROR: site_folder bad in config.json: {site!r}")
        sys.exit(1)

    python = sys.executable

    # ── 1. Smoke test ─────────────────────────────────────────────────────
    step("STEP 1/4  -  Smoke test")
    rc, out = run([python, os.path.join(SCRIPT_DIR, "smoke_test.py")])
    print(out)
    if rc != 0:
        print("\nABORTED: smoke test failed.")
        sys.exit(1)

    # ── 2. Health check (info only) ───────────────────────────────────────
    step("STEP 2/4  -  Question health check")
    rc, out = run([python, os.path.join(SCRIPT_DIR, "health_check.py"), "--threshold", "60"])
    print(out)

    # ── 3. Build zip with allow-list ──────────────────────────────────────
    step("STEP 3/4  -  Building deploy zip (allow-list)")
    stamp   = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_dir = os.path.join(ROOT_DIR, "deploys")
    os.makedirs(zip_dir, exist_ok=True)
    zip_path = os.path.join(zip_dir, f"quizvault_{stamp}.zip")

    referenced_images = find_referenced_images(site)
    print(f"  Referenced images: {len(referenced_images)}")

    file_count = 0
    skipped    = 0
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for entry in os.listdir(site):
            full_entry = os.path.join(site, entry)
            if os.path.isfile(full_entry):
                if entry in ALLOWED_TOP_FILES:
                    zf.write(full_entry, entry)
                    file_count += 1
                else:
                    skipped += 1
                continue
            if not os.path.isdir(full_entry):
                continue
            if entry not in ALLOWED_TOP_DIRS:
                skipped += 1
                continue
            for root, dirs, files in os.walk(full_entry):
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for f in files:
                    full = os.path.join(root, f)
                    rel  = os.path.relpath(full, site).replace("\\", "/")
                    if is_deploy_file(rel, referenced_images):
                        if csscompressor and rel.endswith('.css'):
                            with open(full, 'r', encoding='utf-8') as f:
                                minified = csscompressor.compress(f.read())
                            zf.writestr(rel, minified)
                            file_count += 1
                        elif jsmin and rel.endswith('.js') and 'min.js' not in rel:
                            with open(full, 'r', encoding='utf-8') as f:
                                minified = jsmin.jsmin(f.read())
                            zf.writestr(rel, minified)
                            file_count += 1
                        else:
                            zf.write(full, rel)
                            file_count += 1
                    else:
                        skipped += 1

    size_kb = os.path.getsize(zip_path) / 1024
    print(f"  Built: {zip_path}")
    print(f"  Files: {file_count} included, {skipped} skipped")
    print(f"  Size:  {size_kb:.0f} KB ({size_kb/1024:.1f} MB)")

    if size_kb > 100_000:  # > 100 MB
        print()
        print("  WARNING: zip is > 100 MB. Netlify free tier limit is ~100 MB per deploy.")
        print("  Investigate large files in images/ — you may have backups bloating it.")

    # ── 4. Open Explorer + Netlify Drop ───────────────────────────────────
    step("STEP 4/4  -  Open Netlify Drop")
    print(f"\n  Opening folder: {zip_dir}")
    print(f"  Opening Netlify Drop in browser...")
    print(f"\n  HOW TO DEPLOY:")
    print(f"    Drag {os.path.basename(zip_path)} from the Explorer window")
    print(f"    onto the Netlify Drop page that just opened.")
    print(f"\n  Done!")

    if os.name == "nt":
        os.startfile(zip_dir)
    webbrowser.open("https://app.netlify.com/drop")


if __name__ == "__main__":
    main()
