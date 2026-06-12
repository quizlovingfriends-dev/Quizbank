"""
site_updater.py
---------------
Layer 3 execution: safely inject a quiz card HTML block into index.html.
- Creates a .bak backup before any write
- Injects ABOVE the <!-- END_QUIZZES --> marker
- If marker not found, appends it before </body>
- Atomic write via temp file to avoid corruption
"""

import logging
import shutil
import tempfile
from pathlib import Path

log = logging.getLogger(__name__)

MARKER = "<!-- END_QUIZZES -->"
FALLBACK_MARKER_INJECTION = "</body>"


def inject_quiz_card(card_html: str, index_html_path: str, marker: str = MARKER) -> bool:
    """
    Insert card_html into index.html just before the marker.
    Returns True on success, False on failure.
    Never raises — logs errors instead.
    """
    path = Path(index_html_path)

    if not path.exists():
        log.warning(f"index.html not found at {path} — creating a new one")
        _create_skeleton(path, marker)

    # Read current content
    try:
        original = path.read_text(encoding="utf-8")
    except Exception as e:
        log.error(f"Could not read {path}: {e}")
        return False

    # Backup
    backup_path = path.with_suffix(".html.bak")
    try:
        shutil.copy2(path, backup_path)
        log.info(f"Backup written: {backup_path}")
    except Exception as e:
        log.error(f"Backup failed: {e} — aborting to protect original")
        return False

    # Inject
    if marker in original:
        updated = original.replace(marker, card_html + "\n\n" + marker, 1)
    elif FALLBACK_MARKER_INJECTION in original:
        log.warning(f"Marker '{marker}' not found — injecting before </body>")
        updated = original.replace(
            FALLBACK_MARKER_INJECTION,
            card_html + "\n\n" + marker + "\n" + FALLBACK_MARKER_INJECTION,
            1
        )
    else:
        log.warning("Neither marker nor </body> found — appending to end of file")
        updated = original + "\n\n" + card_html + "\n\n" + marker + "\n"

    # Atomic write via temp file
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8",
            dir=path.parent, delete=False, suffix=".tmp"
        ) as tmp:
            tmp.write(updated)
            tmp_path = Path(tmp.name)
        tmp_path.replace(path)
        log.info(f"index.html updated: {path}")
        return True
    except Exception as e:
        log.error(f"Write failed: {e}")
        # Restore backup
        try:
            shutil.copy2(backup_path, path)
            log.info("Restored from backup after write failure")
        except Exception as re:
            log.error(f"Restore also failed: {re}")
        return False


def _create_skeleton(path: Path, marker: str):
    """Create a minimal index.html if none exists."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Bank</title>
  <style>
    body {{ font-family: sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; }}
    .quiz-card {{ border: 1px solid #ddd; border-radius: 8px; margin-bottom: 2rem; overflow: hidden; }}
    .quiz-card__image-wrap {{ height: 200px; background: #444; position: relative; overflow: hidden; }}
    .quiz-card__image-wrap img {{ width: 100%; height: 100%; object-fit: cover; }}
    .quiz-card__category-badge {{ position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,.6); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 13px; }}
    .quiz-card__body {{ padding: 1.5rem; }}
    .quiz-card__title {{ margin: 0 0 .5rem; font-size: 1.4rem; }}
    .quiz-card__meta {{ color: #666; font-size: .9rem; margin-bottom: 1.5rem; }}
    .quiz-question {{ margin-bottom: 1.5rem; }}
    .quiz-question__options {{ list-style: none; padding: 0; margin: .5rem 0; }}
    .quiz-question__option {{ padding: .4rem .8rem; margin: .3rem 0; border-radius: 4px; background: #f5f5f5; }}
    .quiz-question__option--correct {{ background: #e8f5e9; border-left: 3px solid #388e3c; }}
    .quiz-question__answer {{ background: #fffde7; padding: .5rem 1rem; border-radius: 4px; margin-top: .5rem; }}
    .quiz-card__reveal-btn {{ background: #185FA5; color: #fff; border: none; padding: .5rem 1.2rem; border-radius: 4px; cursor: pointer; font-size: .95rem; }}
    .quiz-card__reveal-btn:hover {{ background: #0C447C; }}
  </style>
</head>
<body>
  <h1>Quiz Bank</h1>
  <p>Quizzes are added automatically below.</p>

{marker}
</body>
</html>
""", encoding="utf-8")
    log.info(f"Created new index.html at {path}")
