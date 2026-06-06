import os
import json
import re
from spellchecker import SpellChecker

# ── CONFIG ──────────────────────────────────────────────────────────────────
SITE_DIR = "D:/QUIZBANK"
QUESTIONS_JS = os.path.join(SITE_DIR, "data", "questions.js")
BACKUP_JS = os.path.join(SITE_DIR, "data", "questions.js.pre_cleanup_v2.bak")

spell = SpellChecker()

FIXES = [
    (r'\bI0\b', '10'),         (r'\bl0\b', '10'),
    (r'\bO\b(?=\d)', '0'),     # 'O5' → '05'
    (r'\b1\b(?=\s+[a-z])', 'I'), # '1 had' → 'I had'
    (r'(?<=[a-z])0(?=[a-z])', 'o'),  # 'lo0k' → 'look'
    (r'(?<=[\w])\.(?=[\w])', '. '),  # 'word.Another' → 'word. Another'
    (r'\s+([.,;:!?])', r'\1'),   # spaces before punctuation
    (r'\s{2,}', ' '),            # collapse runs of spaces
    (r'^\s*0\s+', ''),           # leading "0 " before question
    (r'\b(\w)\1{4,}\b', r'\1'),  # 'aaaaa' → 'a'
]

def load_questions():
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    start_tag = 'const QUIZ_QUESTIONS = '
    json_str = content[content.find(start_tag) + len(start_tag):].strip()
    if json_str.endswith(";"):
        json_str = json_str[:-1]
    return json.loads(json_str)

def clean_text(text):
    if not text: return text
    
    # Pass A - Common OCR artifacts
    for pat, repl in FIXES:
        text = re.sub(pat, repl, text)
    
    # Pass B - Garbled-token detection
    words = text.split()
    new_words = []
    for word in words:
        clean_word = re.sub(r'[^\w]', '', word)
        # Mix of cases + unknown to dictionary
        if len(clean_word) >= 5 and any(c.isupper() for c in clean_word[1:]) and any(c.islower() for c in clean_word):
            if clean_word.lower() not in spell:
                correction = spell.correction(clean_word)
                if not correction or len(set(clean_word.lower()) ^ set(correction.lower())) > 3:
                    # Too garbled, drop it
                    continue
        new_words.append(word)
    text = " ".join(new_words)
    
    return text

def strip_answer_junk(text):
    if not text: return text
    # Pass C - Trailing junk
    # Split on [ATTACH IMAGE, 3+ hyphens/em-dashes, or U+FFFD
    text = re.split(r'\[ATTACH IMAGE|---|\xef\xbf\xbd', text)[0]
    return text.strip()

def main():
    if not os.path.exists(QUESTIONS_JS): return
    
    # Backup
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        with open(BACKUP_JS, "w", encoding="utf-8") as bf:
            bf.write(f.read())
            
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    start_tag = 'const QUIZ_QUESTIONS = '
    json_str = content[content.find(start_tag) + len(start_tag):].strip()
    if json_str.endswith(";"): json_str = json_str[:-1]
    questions = json.loads(json_str)

    modified_count = 0
    tokens_removed = 0

    for q in questions:
        original = json.dumps(q)
        
        q["question"]["text"] = clean_text(q["question"]["text"])
        q["answer"]["text"] = strip_answer_junk(clean_text(q["answer"]["text"]))
        if q.get("funda"):
            q["funda"]["text"] = clean_text(q["funda"]["text"])
            
        if json.dumps(q) != original:
            modified_count += 1

    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const QUIZ_QUESTIONS = ")
        f.write(json.dumps(questions, indent=2))
        f.write(";")

    print(f"OCR Cleanup complete. Modified {modified_count} questions.")

if __name__ == "__main__":
    main()
