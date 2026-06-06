"""
questions_updater.py — Append extracted questions to data/questions.js.
Copies any extracted images to the site's images/ folder.
Usage: python scripts/questions_updater.py < extracted.json
       python scripts/questions_updater.py <json_file>
"""
import sys
import os
import re
import json
import shutil
from datetime import datetime, timezone

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def find_questions_js(site_folder):
    candidates = [
        os.path.join(site_folder, "data", "questions.js"),
        os.path.join(site_folder, "questions.js"),
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    path = candidates[0]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("const QUIZ_QUESTIONS = [\n];\n")
    return path


def find_images_dir(site_folder):
    candidates = [
        os.path.join(site_folder, "images"),
        os.path.join(site_folder, "img"),
    ]
    for c in candidates:
        if os.path.isdir(c):
            return c
    # Create images/ if absent
    path = candidates[0]
    os.makedirs(path, exist_ok=True)
    return path


def parse_max_id(js_text):
    ids = re.findall(r"\bid\s*:\s*(\d+)", js_text)
    return max((int(i) for i in ids), default=100)


def js_value(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    escaped = v.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def build_js_object(q, indent="  "):
    i2 = indent + "  "
    lines = [
        f"{indent}{{",
        f"{i2}id: {q['id']},",
        f"{i2}topic: {js_value(q['topic'])},",
        f"{i2}question: {{",
        f"{i2}  text: {js_value(q['question']['text'])},",
        f"{i2}  image: {js_value(q['question']['image'])}",
        f"{i2}}},",
        f"{i2}answer: {{",
        f"{i2}  text: {js_value(q['answer']['text'])},",
        f"{i2}  image: {js_value(q['answer']['image'])}",
        f"{i2}}},",
        f"{i2}funda: {{",
        f"{i2}  text: {js_value(q['funda']['text'])},",
        f"{i2}  image: {js_value(q['funda']['image'])}",
        f"{i2}}}",
        f"{indent}}}",
    ]
    return "\n".join(lines)


def validate_js(js_text):
    if "const QUIZ_QUESTIONS" not in js_text:
        raise ValueError("QUIZ_QUESTIONS declaration missing from output")
    if not re.search(r"\]\s*;", js_text):
        raise ValueError("Array closing ]; not found in output")


# ── New-question validation & duplicate detection ────────────────────────────

ALLOWED_TOPICS = {"sports", "wildlife", "current-affairs", "history", "politics", "cuisines", "general"}

def validate_question(q):
    """
    Strict per-question validator. Returns (is_valid, reason_string).
    Used before inserting into questions.js.
    """
    if not isinstance(q, dict):
        return False, "not a dict"
    qt = (q.get("question_text") or "").strip()
    at = (q.get("answer_text")   or "").strip()
    if len(qt) < 5:
        return False, f"question too short ({len(qt)} chars)"
    if len(at) < 2:
        return False, f"answer too short ({len(at)} chars)"
    if len(qt) > 2000:
        return False, "question too long (>2000 chars)"
    if len(at) > 500:
        return False, "answer too long (>500 chars)"
    topic = q.get("topic") or "general"
    if topic not in ALLOWED_TOPICS:
        return False, f"invalid topic: {topic!r}"
    # Check for obvious OCR garbage (very low alpha ratio in the answer)
    alpha = sum(c.isalpha() or c.isspace() for c in at)
    if at and alpha / len(at) < 0.5:
        return False, "answer has too much OCR noise"
    return True, "ok"


def normalize_for_compare(text):
    """Lower-case + strip non-alphanumerics for fuzzy duplicate compare."""
    return re.sub(r"[^a-z0-9]+", "", (text or "").lower())


def parse_existing_questions(js_text):
    """
    Pull out existing question text for duplicate-checking.
    Handles both unquoted (`text:`) and quoted (`"text":`) JS object keys.
    Returns list of (full_normalized, prefix_60chars) tuples for fuzzy compare.
    """
    pattern = re.compile(
        r'(?:question|"question")\s*:\s*\{\s*(?:text|"text")\s*:\s*"((?:[^"\\]|\\.)*)"',
        re.MULTILINE,
    )
    snips = []
    for m in pattern.finditer(js_text):
        text = m.group(1).replace('\\"', '"').replace("\\\\", "\\")
        full = normalize_for_compare(text)
        snips.append((full, full[:60]))
    return snips


def _trigrams(s):
    """Tiny Jaccard-trigram fuzzy distance for last-line of defense dedup."""
    s = s.lower()
    return {s[i:i+3] for i in range(len(s) - 2)} if len(s) >= 3 else set()


def is_duplicate(q_text, existing_pairs):
    """
    Multi-layer dedup:
      1. exact 60-char prefix match
      2. full normalized equality
      3. trigram Jaccard similarity >= 0.75 (catches reworded duplicates)
    """
    norm = normalize_for_compare(q_text)
    if not norm:
        return False
    prefix = norm[:60]
    new_grams = _trigrams(norm[:200])
    for full, pfx in existing_pairs:
        if prefix == pfx:
            return True
        if norm == full:
            return True
        if new_grams and len(new_grams) >= 5:
            old_grams = _trigrams(full[:200])
            if old_grams:
                overlap = len(new_grams & old_grams)
                union   = len(new_grams | old_grams)
                if union and (overlap / union) >= 0.75:
                    return True
    return False


def copy_image(src_path, images_dir, question_id, role="question"):
    """
    Copy an image from temp location to the site's images/ folder.
    role: "question" | "answer" | "funda"
    Returns the relative web path (e.g. "images/q42_question.jpg") or None.
    """
    if not src_path or not os.path.isfile(src_path):
        return None
    ext = os.path.splitext(src_path)[1].lower() or ".jpg"
    dest_name = f"q{question_id}_{role}{ext}"
    dest_path = os.path.join(images_dir, dest_name)
    counter = 1
    while os.path.exists(dest_path):
        dest_name = f"q{question_id}_{role}_{counter}{ext}"
        dest_path = os.path.join(images_dir, dest_name)
        counter += 1
    shutil.copy2(src_path, dest_path)
    return f"images/{dest_name}"


def main():
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            extracted = json.load(f)
    else:
        raw = sys.stdin.read().strip()
        if not raw:
            print("No input provided.", file=sys.stderr)
            sys.exit(1)
        extracted = json.loads(raw)

    try:
        config = load_config()
    except Exception as e:
        print(f"Failed to load config.json: {e}", file=sys.stderr)
        sys.exit(1)

    site_folder = config.get("site_folder", "").strip()
    if not site_folder or not os.path.isdir(site_folder):
        print(f"site_folder not found: {site_folder!r}", file=sys.stderr)
        sys.exit(1)

    qs_path    = find_questions_js(site_folder)
    images_dir = find_images_dir(site_folder)

    with open(qs_path, "r", encoding="utf-8") as f:
        original_js = f.read()

    bak_path = qs_path + ".bak"
    shutil.copy2(qs_path, bak_path)

    max_id        = parse_max_id(original_js)
    new_questions = extracted.get("questions", [])

    if not new_questions:
        print("No questions to add.")
        sys.exit(0)

    # ── Pre-flight: validate + dedupe ───────────────────────────────────────
    existing_norms = set(parse_existing_questions(original_js))
    accepted = []
    rejected = []
    for q in new_questions:
        ok, reason = validate_question(q)
        if not ok:
            rejected.append((q.get("question_text", "")[:60], reason))
            continue
        if is_duplicate(q.get("question_text", ""), existing_norms):
            rejected.append((q.get("question_text", "")[:60], "duplicate of existing"))
            continue
        accepted.append(q)
        existing_norms.add(normalize_for_compare(q.get("question_text", ""))[:60])

    if rejected:
        print(f"Rejected {len(rejected)} question(s):", file=sys.stderr)
        for snippet, why in rejected[:20]:
            print(f"  - [{why}] {snippet}", file=sys.stderr)

    if not accepted:
        print("No valid new questions to add (all were rejected).")
        sys.exit(0)

    new_questions = accepted

    built_objects = []
    images_copied = 0

    for idx, q in enumerate(new_questions):
        qid = max_id + idx + 1

        # Copy question image if present
        q_img_src = q.get("question_image_path")
        q_img_web = copy_image(q_img_src, images_dir, qid, role="question")
        if q_img_web:
            images_copied += 1

        # Copy answer image if present (e.g. from OCR answer slides)
        a_img_src = q.get("answer_image_path")
        a_img_web = copy_image(a_img_src, images_dir, qid, role="answer")
        if a_img_web:
            images_copied += 1

        obj = {
            "id":    qid,
            "topic": q.get("topic", "general"),
            "question": {
                "text":  q.get("question_text", ""),
                "image": q_img_web,
            },
            "answer": {
                "text":  q.get("answer_text", ""),
                "image": a_img_web,
            },
            "funda": {
                "text":  q.get("funda_text", ""),
                "image": None,
            },
        }
        built_objects.append(obj)

    date_str  = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    separator = f"  // ─── ADDED BY AUTOMATOR: {date_str} ───────────────────────────────────"
    new_block = separator + "\n" + ",\n".join(build_js_object(o) for o in built_objects) + ","

    array_match = re.search(r"(const QUIZ_QUESTIONS\s*=\s*\[)([\s\S]*?)(\];)", original_js)
    if array_match:
        prefix       = array_match.group(1)
        body         = array_match.group(2).rstrip()
        if body and not body.rstrip().endswith(","):
            body += ","
        new_js = (
            original_js[: array_match.start()]
            + prefix + body + "\n\n" + new_block + "\n];\n"
        )
    else:
        new_js = original_js.rstrip() + "\n\n" + new_block + "\n"

    validate_js(new_js)

    with open(qs_path, "w", encoding="utf-8") as f:
        f.write(new_js)

    new_total = max_id + len(built_objects)
    print(f"Added {len(built_objects)} questions to {qs_path}")
    print(f"ID range: {max_id+1} – {new_total}  |  Images copied: {images_copied}  |  Backup: {bak_path}")


if __name__ == "__main__":
    main()
