"""
apply_approvals.py — Take the JSON exported from admin-review.html and
apply the decisions:
  - Approved + edited questions → merged into data/questions.js
  - Rejected questions          → removed from pending queue + logged
  - Pending queue is rewritten without the processed items

Usage:
  python scripts/apply_approvals.py path/to/approvals_xxx.json
"""
import os
import re
import sys
import json
import shutil
import subprocess
import datetime

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

from pending_queue import load_queue, save_queue
from quality_gate import classify_question


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_max_id(js_text):
    ids = re.findall(r'(?:\bid|"id")\s*:\s*(\d+)', js_text)
    return max((int(i) for i in ids), default=100)


def verify_js(text):
    try:
        rc = subprocess.run(
            ["node", "-e", "new Function(require('fs').readFileSync(0,'utf8')+'\\nreturn QUIZ_QUESTIONS;')()"],
            input=text, capture_output=True, text=True, timeout=10)
        return rc.returncode == 0
    except Exception:
        return False


def merge_into_questions_js(qs_path, new_questions):
    """Append the new questions to questions.js, returning (count_added, ok)."""
    with open(qs_path, "r", encoding="utf-8") as f:
        text = f.read()

    max_id = parse_max_id(text)
    added = []
    for q in new_questions:
        max_id += 1
        nested = {
            "id":         max_id,
            "topic":      q.get("topic", "general"),
            "difficulty": q.get("difficulty", "medium"),
            "question":   {"text": q.get("question_text", ""), "image": q.get("question_image_path")},
            "answer":     {"text": q.get("answer_text",   ""), "image": q.get("answer_image_path")},
            "funda":      {"text": q.get("funda_text",    ""), "image": q.get("funda_image_path")},
        }
        added.append(nested)

    # Insert before the closing ];
    addition = ",\n  " + ",\n  ".join(
        json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ")
        for o in added
    )
    new_text = re.sub(r"\]\s*;\s*$", addition + "\n];\n", text)

    if not verify_js(new_text):
        return 0, False

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.copy2(qs_path, qs_path + f".apply_{stamp}.bak")
    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)
    return len(added), True


def main():
    if len(sys.argv) < 2:
        print("Usage: apply_approvals.py <approvals.json>")
        sys.exit(1)

    approvals_path = sys.argv[1]
    if not os.path.isfile(approvals_path):
        print(f"Not found: {approvals_path}")
        sys.exit(1)

    with open(approvals_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    decisions = payload.get("decisions", {})
    if not decisions:
        print("No decisions in file. Nothing to do.")
        sys.exit(0)

    cfg  = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")

    queue = load_queue()
    items = queue.get("items", [])

    approved_items   = []
    rejected_indices = set()

    for idx_str, decision in decisions.items():
        idx = int(idx_str)
        if idx < 0 or idx >= len(items): continue

        original = items[idx]
        edits    = decision.get("edits") or {}
        verdict  = decision.get("decision")

        if verdict == "reject":
            rejected_indices.add(idx)
            continue

        if verdict == "approve":
            # Merge the edits into the original question
            q = dict(original.get("question") or {})
            for k, v in edits.items():
                q[k] = v

            # Re-score with the gate
            new_gate = classify_question(q)
            if new_gate["verdict"] == "rejected":
                print(f"  Q@{idx} still rejected after edits (score={new_gate['score']}). Skipping.")
                continue
            approved_items.append((idx, q, new_gate))

    # ── Apply approvals ──────────────────────────────────────────────────
    if approved_items:
        ok_to_merge = [q for _, q, _ in approved_items]
        added, ok = merge_into_questions_js(qs_path, ok_to_merge)
        if not ok:
            print("ERROR: merged file failed JS validation. Nothing written.")
            sys.exit(1)
        print(f"✓ Merged {added} approved question(s) into {qs_path}")
    else:
        print("No approvals to merge.")

    # ── Remove processed items from pending queue ────────────────────────
    keep = []
    for i, it in enumerate(items):
        if i in {idx for idx, _, _ in approved_items} or i in rejected_indices:
            continue
        keep.append(it)
    queue["items"] = keep
    save_queue(queue)

    # ── Audit trail ──────────────────────────────────────────────────────
    audit_dir = os.path.join(SCRIPT_DIR, "..", "logs")
    os.makedirs(audit_dir, exist_ok=True)
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(os.path.join(audit_dir, f"approvals_{stamp}.json"), "w", encoding="utf-8") as f:
        json.dump({
            "applied_at": stamp,
            "approved":   len(approved_items),
            "rejected":   len(rejected_indices),
            "source":     approvals_path,
        }, f, indent=2)

    print(f"\nSummary:")
    print(f"  Approved:  {len(approved_items)}")
    print(f"  Rejected:  {len(rejected_indices)}")
    print(f"  Remaining in queue: {len(keep)}")


if __name__ == "__main__":
    main()
