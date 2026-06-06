"""
fix_visual_prefixes.py — Clean up the bug that polluted 18 question texts.

Some script added "[VISUAL QUESTION — image not available] " as a prefix
to questions where the original image got lost. That prefix should never
have been written into the data — it confuses the OCR matcher and looks
ugly on the site.

Action:
  1. Strip the prefix from all question.text fields where it appears
  2. Revert the wrong Q124 image assignment (was matched to wrong slide)
  3. Backup + validate JS
"""
import os
import re
import shutil
import datetime
import subprocess

SITE = r"D:\QUIZBANK"
QS = os.path.join(SITE, "data", "questions.js")

with open(QS, "r", encoding="utf-8", errors="replace") as f:
    text = f.read()

stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
bak = QS + f".fix_prefix_{stamp}.bak"
shutil.copy2(QS, bak)
print(f"Backup: {bak}")

# 1. Strip the [VISUAL QUESTION ...] prefix (with various dash/replacement chars)
PREFIX_RE = re.compile(
    r'(\[VISUAL QUESTION[^]]*\])\s*',
    re.IGNORECASE,
)
prefixed_count = len(PREFIX_RE.findall(text))
text = PREFIX_RE.sub("", text)

# 2. Revert Q124's wrong image assignment to null
q124_pattern = re.compile(
    r'(\{\s*"id"\s*:\s*124\b[^{}]*?"question"\s*:\s*\{[^{}]*?"image"\s*:\s*)"[^"]*"',
    re.DOTALL,
)
text, q124_reverted = q124_pattern.subn(r'\1null', text, count=1)

# Also delete the wrongly-assigned image file
wrong_q124 = os.path.join(SITE, "images", "q124_question.jpg")
if os.path.isfile(wrong_q124):
    os.remove(wrong_q124)
    print(f"  Deleted wrong file: {wrong_q124}")

with open(QS, "w", encoding="utf-8", newline="\n") as f:
    f.write(text)

# Verify
rc = subprocess.run(
    ["node", "-e",
     "var QUIZ_QUESTIONS;eval(require('fs').readFileSync('" + QS.replace(chr(92), '/') + "','utf8'));"
     "console.log('OK, count:', QUIZ_QUESTIONS.length);"],
    capture_output=True, text=True,
)
print(f"  Stripped [VISUAL QUESTION] prefix from: {prefixed_count} questions")
print(f"  Reverted Q124 image:                    {q124_reverted} (back to null)")
print(f"  JS check: {rc.stdout.strip() or rc.stderr[:200].strip()}")
