"""
pending_queue.py — Read/write helpers for data/pending_questions.json.

The pending queue is a JSON file holding questions that the quality gate
flagged for human review. Each entry has the candidate question plus the
gate's verdict, score, and issues.

JSON shape:
{
  "version": 1,
  "updated_at": "2026-05-19T12:34:56Z",
  "items": [
    {
      "submitted_at": "2026-05-19T12:00:00Z",
      "source": "watcher | community | ai-generator",
      "source_meta": { "filename": "...", "submitter": "..." },
      "question": { "id": null, "topic": "...", ... },
      "gate": {
        "score": 72,
        "verdict": "pending",
        "issues": [...],
        "auto_fixes": { "question_text": "..." }
      }
    }
  ]
}
"""
import os
import json
import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)


def _site_dir():
    with open(os.path.join(ROOT_DIR, "config.json")) as f:
        return json.load(f).get("site_folder", "").strip()


def _queue_path():
    return os.path.join(_site_dir(), "data", "pending_questions.json")


def _now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_queue():
    path = _queue_path()
    if not os.path.isfile(path):
        return {"version": 1, "updated_at": _now(), "items": []}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"version": 1, "updated_at": _now(), "items": []}


def save_queue(queue):
    queue["updated_at"] = _now()
    path = _queue_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)


def add_to_queue(question, gate_result, source="watcher", source_meta=None):
    """Append a single question + gate verdict to the pending queue."""
    queue = load_queue()
    queue["items"].append({
        "submitted_at": _now(),
        "source":       source,
        "source_meta":  source_meta or {},
        "question":     question,
        "gate":         gate_result,
    })
    save_queue(queue)
    return len(queue["items"])


def remove_from_queue(index):
    """Remove item at the given index. Returns the removed item (or None)."""
    queue = load_queue()
    if 0 <= index < len(queue["items"]):
        removed = queue["items"].pop(index)
        save_queue(queue)
        return removed
    return None


def queue_size():
    return len(load_queue().get("items", []))
