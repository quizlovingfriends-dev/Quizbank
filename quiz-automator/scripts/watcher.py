"""
watcher.py — Main orchestration loop. Watches input/ for PDF/PPTX files.
Usage: python scripts/watcher.py
"""
import sys
import os
import json
import time
import shutil
import subprocess
import logging
from datetime import datetime, timezone

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")
LOG_DIR     = os.path.join(ROOT_DIR, "logs")
LOG_PATH    = os.path.join(LOG_DIR, "automation.log")

os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("watcher")


def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")


def log(level, msg):
    logger.info(f"{ts()} [{level:<5}]  {msg}")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def run(cmd, input_data=None):
    """Run a subprocess; return (stdout, stderr, returncode)."""
    result = subprocess.run(
        cmd,
        input=input_data,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout, result.stderr, result.returncode


def process_file(filepath, config):
    filename    = os.path.basename(filepath)
    python      = sys.executable
    extractor   = os.path.join(SCRIPT_DIR, "extractor.py")
    img_fetch   = os.path.join(SCRIPT_DIR, "image_fetcher.py")
    html_build  = os.path.join(SCRIPT_DIR, "html_builder.py")
    updater     = os.path.join(SCRIPT_DIR, "questions_updater.py")
    processed   = os.path.join(ROOT_DIR, config.get("processed_folder", "./processed").lstrip("./"))
    min_q       = config.get("min_questions_required", 3)

    os.makedirs(processed, exist_ok=True)

    log("INFO", f"Detected: {filename}")

    # Step 1 — extract
    stdout, stderr, rc = run([python, extractor, filepath])
    if rc != 0:
        log("ERROR", f"Extraction failed: {stderr.strip()}")
        dest = os.path.join(os.path.dirname(filepath), f"__EXTRACTION_FAILED__{filename}")
        os.rename(filepath, dest)
        return False

    try:
        extracted = json.loads(stdout)
    except json.JSONDecodeError as e:
        log("ERROR", f"Extractor output is not valid JSON: {e}")
        dest = os.path.join(os.path.dirname(filepath), f"__EXTRACTION_FAILED__{filename}")
        os.rename(filepath, dest)
        return False

    q_count = len(extracted.get("questions", []))
    topic   = extracted["questions"][0]["topic"] if q_count else "unknown"
    log("INFO", f"Extracted {q_count} questions (topic: {topic})")

    # Step 2 — check count
    if q_count < min_q:
        log("WARN", f"Only {q_count} questions — below minimum {min_q}. Flagging as NEEDS_REVIEW.")
        dest = os.path.join(os.path.dirname(filepath), f"__NEEDS_REVIEW__{filename}")
        os.rename(filepath, dest)
        return False

    # Step 3 — image fetch (informational only)
    first_q = extracted["questions"][0]["question_text"] if q_count else ""
    img_stdout, _, _ = run([python, img_fetch, topic, first_q])
    img_url = img_stdout.strip()
    if img_url and img_url != "null":
        log("INFO", f"Reference image: {img_url}")

    # Step 4 — html preview
    preview_stdout, preview_stderr, preview_rc = run(
        [python, html_build], input_data=stdout
    )
    if preview_rc == 0:
        log("INFO", f"Preview saved: {preview_stdout.strip()}")
    else:
        log("WARN", f"html_builder warning: {preview_stderr.strip()}")

    # Count images embedded in extracted questions
    img_count = sum(1 for q in extracted.get("questions", []) if q.get("question_image_path"))
    if img_count:
        log("INFO", f"Found {img_count} embedded image(s) — will copy to site images/")

    # Step 5 — update questions.js (also copies images)
    upd_stdout, upd_stderr, upd_rc = run(
        [python, updater], input_data=stdout
    )

    # Clean up temp image files left by extractor (images already copied by updater)
    temp_dirs_to_remove = set()
    for q in extracted.get("questions", []):
        for key in ("question_image_path", "answer_image_path"):
            tmp = q.get(key)
            if tmp and os.path.isfile(tmp):
                try:
                    temp_dirs_to_remove.add(os.path.dirname(tmp))
                    os.remove(tmp)
                except Exception:
                    pass
    for d in temp_dirs_to_remove:
        try:
            if os.path.isdir(d) and not os.listdir(d):
                os.rmdir(d)
        except Exception:
            pass

    if upd_rc != 0:
        log("ERROR", f"questions_updater failed: {upd_stderr.strip()}")
        dest = os.path.join(os.path.dirname(filepath), f"__UPDATE_FAILED__{filename}")
        os.rename(filepath, dest)
        return False

    for line in upd_stdout.strip().splitlines():
        log("INFO", line)

    # Step 6 — archive
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    dest  = os.path.join(processed, f"{stamp}_{filename}")
    shutil.move(filepath, dest)
    log("INFO", f"Archived: {dest}")
    log("INFO", "─" * 45)
    return True


def main():
    log("INFO", "Watcher started.")
    consecutive_failures = 0

    while True:
        try:
            config = load_config()
        except Exception as e:
            log("ERROR", f"Cannot load config.json: {e}")
            time.sleep(10)
            continue

        input_folder = os.path.join(ROOT_DIR, config.get("input_folder", "./input").lstrip("./"))
        os.makedirs(input_folder, exist_ok=True)
        poll = config.get("poll_interval_seconds", 30)

        try:
            entries = sorted(os.listdir(input_folder))
        except Exception:
            entries = []

        files = [
            os.path.join(input_folder, e)
            for e in entries
            if e.lower().endswith((".pdf", ".pptx", ".odf", ".odp", ".odt"))
            and not e.startswith("__")
        ]

        for f in files:
            ok = process_file(f, config)
            if ok:
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                if consecutive_failures >= 3:
                    log("WARN", "3 consecutive pipeline failures — please check the setup.")
                    consecutive_failures = 0

        time.sleep(poll)


if __name__ == "__main__":
    main()
