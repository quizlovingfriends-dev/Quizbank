"""
cleanup_questions.py — Surgical cleanup of low-health questions in questions.js.

Operations:
  1. Strip trailing OCR junk from answers (dashes, "[ATTACH IMAGE...]", U+FFFD chars)
  2. For empty answers + no image: DELETE the question
  3. For empty answers + has image: keep, mark question text as "(see image — needs answer)"
  4. For very short question text + has answer: keep, prefix question with "[Visual]"

Always backs up to questions.js.bak before writing.
"""
import os
import re
import sys
import json

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Cleaning rules ──────────────────────────────────────────────────────────

JUNK_TRAIL_PATTERNS = [
    r"\s*\[ATTACH IMAGE[^\]]*\].*$",      # "[ATTACH IMAGE OF R ASHWIN] ---"
    r"\s*[� ]+\s*[-=_]{3,}.*$", # weird char + dashes
    r"\s*[-=_]{3,}.*$",                    # trailing decoration --- ===
    r"\s*�+.*$",                      # trailing replacement chars
    r"\s*\([0-9]{4}-[0-9]{4}\)\s*$",      # leave (1874-1963) alone? actually keep this one
]
# Drop the last pattern — birth/death years are useful info
JUNK_TRAIL_PATTERNS = JUNK_TRAIL_PATTERNS[:-1]


def clean_answer(text):
    """Remove trailing OCR noise from an answer string."""
    if not text:
        return ""
    s = text
    for pat in JUNK_TRAIL_PATTERNS:
        s = re.sub(pat, "", s, flags=re.DOTALL).strip()
    # Replace any remaining replacement chars
    s = s.replace("�", "").strip()
    return s


# ── JS object surgery ───────────────────────────────────────────────────────

def find_block(text, qid):
    """Return (start, end) of the JS object block for question id=qid."""
    pat = re.compile(r"\{\s*id\s*:\s*" + str(qid) + r"\b", re.MULTILINE)
    m = pat.search(text)
    if not m:
        return None
    # Walk forward, counting braces, to find matching close
    i = m.start()
    depth = 0
    while i < len(text):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                # Include trailing ',' and newline
                end = i + 1
                while end < len(text) and text[end] in ",\r\n \t":
                    end += 1
                return (m.start(), end)
        i += 1
    return None


def replace_field(block, field, new_value):
    """Replace `field: "..."` inside a JS block with new_value (string)."""
    # Escape new_value as JS string
    esc = new_value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    pat = re.compile(r"(" + re.escape(field) + r'\s*:\s*)"((?:[^"\\]|\\.)*)"')
    new_block, n = pat.subn(r'\1"' + esc + r'"', block, count=1)
    if n == 0:
        return block, False
    return new_block, True


def get_field(block, field):
    pat = re.compile(re.escape(field) + r'\s*:\s*"((?:[^"\\]|\\.)*)"')
    m = pat.search(block)
    return m.group(1).replace('\\"', '"').replace("\\\\", "\\") if m else None


def get_image(block, role):
    """role = 'question' / 'answer' / 'funda'. Returns image path or None."""
    outer = re.search(role + r"\s*:\s*\{([^{}]*)\}", block, re.DOTALL)
    if not outer:
        return None
    inner = outer.group(1)
    m = re.search(r'image\s*:\s*"([^"]+)"', inner)
    return m.group(1) if m else None


def replace_inner_text(block, role, new_text):
    """Replace `text: "..."` inside the role's nested object."""
    esc = new_text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    pat = re.compile(
        r"(" + role + r"\s*:\s*\{[^{}]*?text\s*:\s*)" + r'"((?:[^"\\]|\\.)*)"',
        re.DOTALL,
    )
    new_block, n = pat.subn(r'\1"' + esc + r'"', block, count=1)
    return new_block, n > 0


# ── Main ────────────────────────────────────────────────────────────────────

# Question-by-question fix decisions, derived from health_check output
FIXES = {
    # IDs with empty answers + no image -> DELETE
    78:  {"action": "delete", "reason": "empty answer, no image"},
    104: {"action": "delete", "reason": "empty answer, no image"},
    38:  {"action": "delete", "reason": "empty answer + garbled question text"},
    119: {"action": "delete", "reason": "empty answer, theme intro slide"},
    137: {"action": "delete", "reason": "empty answer, no image"},
    138: {"action": "delete", "reason": "empty answer, no image"},

    # Short question text but has a valid answer -> prefix question
    56:  {"action": "prefix_q", "prefix": "[Visual Connect] ",
          "trim_a": True, "reason": "Connect question — answer too long, trim"},
    128: {"action": "prefix_q", "prefix": "[Visual] Fill in the blank — ",
          "reason": "FITB visual"},
    130: {"action": "prefix_q", "prefix": "[Visual] Identify ",
          "reason": "ID visual"},
    152: {"action": "prefix_q", "prefix": "[Visual] Identify the term ",
          "reason": "empty question, has good answer"},

    # Just clean trailing junk from answer
    76:  {"action": "clean_a", "reason": "trailing dashes in answer"},
    133: {"action": "clean_a", "reason": "[ATTACH IMAGE...] in answer"},
    136: {"action": "clean_a", "reason": "trailing dashes in answer"},
    141: {"action": "clean_a", "reason": "answer looks fine — alpha ratio just dipped from year suffix"},
}


def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path = os.path.join(site, "data", "questions.js")

    with open(qs_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Backup
    bak = qs_path + ".pre_cleanup.bak"
    with open(bak, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Backed up to {bak}")
    print()

    deleted = 0
    cleaned = 0
    prefixed = 0

    for qid, plan in FIXES.items():
        block_range = find_block(text, qid)
        if not block_range:
            print(f"  Q{qid}: NOT FOUND in file (skipping)")
            continue
        start, end = block_range
        block = text[start:end]

        action = plan["action"]
        if action == "delete":
            text = text[:start] + text[end:]
            deleted += 1
            print(f"  Q{qid}: DELETED ({plan['reason']})")
            # IMPORTANT: subsequent block lookups may shift, so we re-search each time

        elif action == "clean_a":
            current = get_field(block, "text") or ""
            # We want answer text — find the answer's nested text
            outer = re.search(r"answer\s*:\s*\{([^{}]*)\}", block, re.DOTALL)
            if not outer:
                print(f"  Q{qid}: no answer block — skipping"); continue
            inner = outer.group(1)
            atext_match = re.search(r'text\s*:\s*"((?:[^"\\]|\\.)*)"', inner)
            if not atext_match:
                print(f"  Q{qid}: no answer text — skipping"); continue
            old = atext_match.group(1).replace('\\"', '"').replace("\\\\", "\\")
            new = clean_answer(old)
            if new == old:
                print(f"  Q{qid}: nothing to clean")
                continue
            new_block, ok = replace_inner_text(block, "answer", new)
            if ok:
                text = text[:start] + new_block + text[end:]
                cleaned += 1
                print(f"  Q{qid}: CLEANED  '{old[:40]}...' -> '{new[:40]}...'")

        elif action == "prefix_q":
            outer = re.search(r"question\s*:\s*\{([^{}]*)\}", block, re.DOTALL)
            if not outer:
                print(f"  Q{qid}: no question block — skipping"); continue
            inner = outer.group(1)
            qm = re.search(r'text\s*:\s*"((?:[^"\\]|\\.)*)"', inner)
            old_q = qm.group(1).replace('\\"', '"').replace("\\\\", "\\") if qm else ""
            new_q = (plan["prefix"] + old_q).strip()
            new_block, ok = replace_inner_text(block, "question", new_q)
            if ok:
                # Optional: also trim answer if needed
                if plan.get("trim_a"):
                    am = re.search(r'answer\s*:\s*\{[^{}]*?text\s*:\s*"((?:[^"\\]|\\.)*)"', new_block, re.DOTALL)
                    if am:
                        old_a = am.group(1).replace('\\"', '"').replace("\\\\", "\\")
                        # Take only the first sentence (up to first period)
                        first = old_a.split('.')[0].strip()
                        if first and len(first) > 5:
                            new_block, _ = replace_inner_text(new_block, "answer", first + ".")
                text = text[:start] + new_block + text[end:]
                prefixed += 1
                print(f"  Q{qid}: REPHRASED  '{old_q[:30]}' -> '{new_q[:50]}'")

    # Cleanup: collapse triple newlines that may appear after deletions
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Make sure file still ends with ];
    if not re.search(r"\]\s*;\s*$", text):
        text = text.rstrip().rstrip(",").rstrip() + "\n];\n"

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)

    print()
    print(f"Summary: {deleted} deleted, {cleaned} answers cleaned, {prefixed} questions rephrased")


if __name__ == "__main__":
    main()
