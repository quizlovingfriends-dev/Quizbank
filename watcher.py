"""
watcher.py
----------
Layer 2 orchestration: the main loop.
Watches the input folder, orchestrates all steps for each new quiz file,
handles errors, logs everything, archives processed files.

Run: python scripts/watcher.py
Stop: Ctrl+C
"""

import sys
import json
import time
import shutil
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime

# Add scripts dir to path so siblings import cleanly
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

import extractor
import image_fetcher
import html_builder
import site_updater


# ── Bootstrap ─────────────────────────────────────────────────────────────────

def load_config() -> dict:
    config_path = SCRIPT_DIR.parent / "config.json"
    if not config_path.exists():
        raise FileNotFoundError(f"config.json not found at {config_path}")
    with open(config_path, encoding="utf-8") as f:
        cfg = json.load(f)
    return cfg


def setup_logging(log_file: str) -> logging.Logger:
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    datefmt = "%Y-%m-%dT%H:%M:%S"

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    # Console
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(logging.Formatter(fmt, datefmt))
    root.addHandler(ch)

    # File (rotating, 1MB × 5)
    fh = logging.handlers.RotatingFileHandler(
        log_path, maxBytes=1_000_000, backupCount=5, encoding="utf-8"
    )
    fh.setFormatter(logging.Formatter(fmt, datefmt))
    root.addHandler(fh)

    return logging.getLogger("watcher")


def ensure_folders(cfg: dict):
    for key in ["input_folder", "processed_folder"]:
        p = Path(cfg["paths"][key])
        p.mkdir(parents=True, exist_ok=True)


# ── Core pipeline ─────────────────────────────────────────────────────────────

def process_file(file_path: Path, cfg: dict, log: logging.Logger) -> bool:
    """
    Full pipeline for one quiz file.
    Returns True on success, False on failure.
    Errors are caught and logged — never propagated to the watcher loop.
    """
    log.info(f"{'='*60}")
    log.info(f"Processing: {file_path.name}")

    template_path = str(SCRIPT_DIR.parent / "templates" / "quiz_card.html")
    default_category = cfg["site"].get("default_category", "General Knowledge")

    # ── Step 1: Extract content ───────────────────────────────────────────────
    log.info("Step 1/4 — Extracting quiz content")
    try:
        quiz_data = extractor.extract(str(file_path), default_category)
    except Exception as e:
        log.error(f"Extraction crashed: {e}")
        _flag_file(file_path, "EXTRACTION_CRASH")
        return False

    if quiz_data.status == "failed":
        log.error(f"Extraction failed: {quiz_data.notes}")
        _flag_file(file_path, "EXTRACTION_FAILED")
        return False

    if quiz_data.status == "needs_review":
        log.warning(f"Low question count ({len(quiz_data.questions)}): {quiz_data.notes}")
        _flag_file(file_path, "NEEDS_REVIEW")
        return False

    log.info(f"  Title:     {quiz_data.title}")
    log.info(f"  Category:  {quiz_data.category}")
    log.info(f"  Questions: {len(quiz_data.questions)}")

    # ── Step 2: Fetch image ───────────────────────────────────────────────────
    log.info("Step 2/4 — Fetching image")
    try:
        image_info = image_fetcher.fetch_image(quiz_data.category, quiz_data.title, cfg)
        log.info(f"  Source: {image_info['source']}")
    except Exception as e:
        log.warning(f"Image fetch crashed ({e}) — using fallback gradient")
        image_info = {
            "url": "",
            "fallback_css": "#444441",
            "credit": "No image",
            "source": "fallback"
        }

    # ── Step 3: Build HTML card ───────────────────────────────────────────────
    log.info("Step 3/4 — Building HTML card")
    try:
        card_html = html_builder.build_card(
            quiz_data.to_dict(), image_info, template_path
        )
    except Exception as e:
        log.error(f"HTML build failed: {e}")
        _flag_file(file_path, "HTML_BUILD_FAILED")
        return False

    # ── Step 4: Update site ───────────────────────────────────────────────────
    log.info("Step 4/4 — Updating index.html")
    index_path = cfg["paths"]["index_html"]
    marker = cfg["site"].get("quiz_inject_marker", "<!-- END_QUIZZES -->")

    try:
        success = site_updater.inject_quiz_card(card_html, index_path, marker)
    except Exception as e:
        log.error(f"Site update crashed: {e}")
        _flag_file(file_path, "SITE_UPDATE_FAILED")
        return False

    if not success:
        log.error("Site updater returned failure")
        _flag_file(file_path, "SITE_UPDATE_FAILED")
        return False

    # ── Archive source file ───────────────────────────────────────────────────
    processed_dir = Path(cfg["paths"]["processed_folder"])
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = processed_dir / f"{timestamp}_{file_path.name}"
    try:
        shutil.move(str(file_path), dest)
        log.info(f"Archived to: {dest}")
    except Exception as e:
        log.warning(f"Archive failed (file stays in input): {e}")

    log.info(f"SUCCESS — '{quiz_data.title}' added to site")
    return True


def _flag_file(file_path: Path, reason: str):
    """Rename file with a flag prefix so it's easy to spot."""
    flagged = file_path.parent / f"__{reason}__{file_path.name}"
    try:
        file_path.rename(flagged)
        logging.getLogger("watcher").warning(f"Flagged: {flagged.name}")
    except Exception:
        pass


# ── Watcher loop ──────────────────────────────────────────────────────────────

def watch(cfg: dict, log: logging.Logger):
    input_dir = Path(cfg["paths"]["input_folder"])
    poll_interval = cfg["watcher"].get("poll_interval_seconds", 30)
    supported_exts = set(cfg["watcher"].get("supported_extensions", [".pdf", ".pptx", ".ppt"]))

    log.info(f"Watching: {input_dir}")
    log.info(f"Poll interval: {poll_interval}s")
    log.info(f"Supported: {', '.join(supported_exts)}")
    log.info("Press Ctrl+C to stop.")

    seen_files: set[Path] = set()

    while True:
        try:
            current_files = {
                f for f in input_dir.iterdir()
                if f.is_file()
                and f.suffix.lower() in supported_exts
                and not f.name.startswith("__")    # skip flagged files
            }

            new_files = current_files - seen_files

            for file_path in sorted(new_files):
                # Brief pause — let the OS finish writing the file
                time.sleep(1)
                if file_path.exists():
                    process_file(file_path, cfg, log)

            seen_files = current_files - {
                f for f in current_files if not f.exists()
            }

        except KeyboardInterrupt:
            log.info("Watcher stopped by user.")
            break
        except Exception as e:
            log.error(f"Watcher loop error: {e}")

        time.sleep(poll_interval)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        cfg = load_config()
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    log = setup_logging(cfg["paths"].get("log_file", "logs/automation.log"))
    ensure_folders(cfg)

    log.info("Quiz Site Automator started")
    log.info(f"Index HTML: {cfg['paths']['index_html']}")

    watch(cfg, log)
