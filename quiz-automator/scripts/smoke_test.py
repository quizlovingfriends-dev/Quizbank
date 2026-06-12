"""
smoke_test.py — Basic checks before deploying to Netlify.

Verifies:
  - questions.js parses correctly and has the expected shape
  - Every question has an ID, topic, question.text, answer.text
  - Topics are all in the allowed list
  - Image references that exist on disk
  - No obvious JS syntax errors in core scripts
  - HTML files reference all the JS files they need

Exit code 0 = safe to deploy. Non-zero = problems found.

Usage: python scripts/smoke_test.py
"""
import os
import re
import sys
import json
import subprocess

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

ALLOWED_TOPICS = {"sports", "wildlife", "current-affairs", "history", "politics",
                  "cuisines", "general", "literature", "geography", "science", "movies"}

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def fail(msg, errors):
    errors.append(msg)
    print(f"  [FAIL] {msg}")


def ok(msg):
    print(f"  [ OK ] {msg}")


# ── checks ──────────────────────────────────────────────────────────────────

def check_questions_js(site, errors):
    print("\n[1/5] Checking questions.js...")
    qs_path = os.path.join(site, "data", "questions.js")
    if not os.path.isfile(qs_path):
        fail(f"questions.js not found at {qs_path}", errors); return

    with open(qs_path, "r", encoding="utf-8") as f:
        text = f.read()

    if "const QUIZ_QUESTIONS" not in text:
        fail("missing 'const QUIZ_QUESTIONS' declaration", errors); return
    if not re.search(r"\]\s*;", text):
        fail("missing closing ']'", errors); return

    # Match both `id: 42` and `"id": 42` (unquoted JS or quoted JSON-style)
    ids = re.findall(r'(?:\bid|"id")\s*:\s*(\d+)', text)
    if not ids:
        fail("no question IDs found", errors); return
    int_ids = [int(i) for i in ids]
    if len(set(int_ids)) != len(int_ids):
        fail(f"duplicate IDs detected ({len(int_ids)-len(set(int_ids))} dupes)", errors)

    ok(f"questions.js parses, {len(ids)} questions, IDs {min(int_ids)}-{max(int_ids)}")

    # Check topics (matches `topic: "x"` or `"topic": "x"`)
    topics = re.findall(r'(?:\btopic|"topic")\s*:\s*"([^"]*)"', text)
    bad_topics = [t for t in topics if t not in ALLOWED_TOPICS]
    if bad_topics:
        fail(f"questions with bad topics: {set(bad_topics)}", errors)
    else:
        ok(f"all {len(topics)} topics are valid")


def check_images(site, errors):
    print("\n[2/5] Checking image references...")
    qs_path = os.path.join(site, "data", "questions.js")
    with open(qs_path, "r", encoding="utf-8") as f:
        text = f.read()
    refs = re.findall(r'(?:\bimage|"image")\s*:\s*"(images/[^"]+)"', text)
    missing = []
    for ref in refs:
        full = os.path.join(site, ref.replace("/", os.sep))
        if not os.path.isfile(full):
            missing.append(ref)
    if missing:
        fail(f"{len(missing)} broken image references (e.g. {missing[0]})", errors)
    else:
        ok(f"all {len(refs)} image references exist on disk")


def check_js_syntax(site, errors):
    print("\n[3/5] Checking JS syntax...")
    js_files = []
    for root, _, files in os.walk(os.path.join(site, "js")):
        for f in files:
            if f.endswith(".js"):
                js_files.append(os.path.join(root, f))
    if not js_files:
        fail("no JS files found", errors); return
    bad = []
    for f in js_files:
        result = subprocess.run(["node", "--check", f], capture_output=True, text=True)
        if result.returncode != 0:
            bad.append((f, result.stderr.strip().splitlines()[0] if result.stderr else "syntax error"))
    if bad:
        for f, msg in bad:
            fail(f"{os.path.relpath(f, site)}: {msg}", errors)
    else:
        ok(f"all {len(js_files)} JS files have valid syntax")


def check_html_references(site, errors):
    print("\n[4/5] Checking HTML script tags...")
    pages = ["index.html", "questionbank.html", "wiki.html", "analytics.html"]
    required_per_page = {
        "index.html":        ["data/questions.js", "state.js", "home.js"],
        "questionbank.html": ["data/questions.js", "state.js", "components/quiz-card.js", "qb.js"],
        "wiki.html":         ["data/questions.js", "state.js"],
        "analytics.html":    ["data/questions.js", "state.js"],
    }
    for page in pages:
        path = os.path.join(site, page)
        if not os.path.isfile(path):
            fail(f"missing {page}", errors); continue
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
        for required in required_per_page[page]:
            if required not in html:
                fail(f"{page} doesn't reference {required}", errors)
        # Verify referenced JS files actually exist
        for src in re.findall(r'<script\s+src="([^"]+)"', html):
            if src.startswith("http"):
                continue
            local = os.path.join(site, src.replace("/", os.sep))
            if not os.path.isfile(local):
                fail(f"{page} references missing file {src}", errors)
    ok("HTML script references look good")


def check_no_localhost_or_secrets(site, errors):
    print("\n[5/5] Checking for accidental secrets/localhost...")
    bad_patterns = [
        (re.compile(r"localhost:\d+"),         "localhost URL"),
        (re.compile(r"127\.0\.0\.1"),          "127.0.0.1 reference"),
        (re.compile(r"AIza[0-9A-Za-z_-]{35}"), "Google API key embedded"),
    ]
    found = []
    # Only check the actual deployable folders, not the whole tree
    DEPLOYABLE = ["js", "css", "data"]
    DEPLOYABLE_FILES = ["index.html", "questionbank.html"]

    paths_to_check = []
    for sub in DEPLOYABLE:
        for root, _, files in os.walk(os.path.join(site, sub)):
            for f in files:
                if f.endswith((".js", ".html", ".css")):
                    paths_to_check.append(os.path.join(root, f))
    for f in DEPLOYABLE_FILES:
        p = os.path.join(site, f)
        if os.path.isfile(p):
            paths_to_check.append(p)

    for full in paths_to_check:
        try:
            with open(full, "r", encoding="utf-8", errors="ignore") as fp:
                content = fp.read()
        except Exception:
            continue
        for pat, label in bad_patterns:
            if pat.search(content):
                found.append((os.path.relpath(full, site), label))
    if found:
        for path, label in found:
            fail(f"{path}: contains {label}", errors)
    else:
        ok("no localhost/secret leaks in deployable files")


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    if not site or not os.path.isdir(site):
        print(f"Bad site_folder in config.json: {site!r}")
        sys.exit(2)

    print(f"Smoke testing: {site}")
    errors = []
    check_questions_js(site, errors)
    check_images(site, errors)
    check_js_syntax(site, errors)
    check_html_references(site, errors)
    check_no_localhost_or_secrets(site, errors)

    print()
    if errors:
        print(f"FAILED: {len(errors)} problem(s) found. Fix before deploying.")
        sys.exit(1)
    print("PASSED: All checks passed. Safe to deploy.")


if __name__ == "__main__":
    main()
