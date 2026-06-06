import os
import json
import requests

# ── CONFIG ──────────────────────────────────────────────────────────────────
SITE_DIR = "D:/QUIZBANK"
QUESTIONS_JS = os.path.join(SITE_DIR, "data", "questions.js")
COMMON_WORDS_PATH = os.path.join(SITE_DIR, "quiz-automator", "data", "common_words.txt")
BACKUP_JS = os.path.join(SITE_DIR, "data", "questions.js.pre_difficulty.bak")

WORD_LIST_URL = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt"

def load_common_words():
    if not os.path.exists(os.path.dirname(COMMON_WORDS_PATH)):
        os.makedirs(os.path.dirname(COMMON_WORDS_PATH))
    
    if not os.path.exists(COMMON_WORDS_PATH):
        print("Downloading common words list...")
        try:
            r = requests.get(WORD_LIST_URL, verify=False, timeout=10)
            with open(COMMON_WORDS_PATH, "w", encoding="utf-8") as f:
                f.write(r.text)
        except Exception as e:
            print(f"Warning: Could not download word list ({e}). Using minimal fallback.")
            with open(COMMON_WORDS_PATH, "w", encoding="utf-8") as f:
                f.write("the\nbe\nto\nof\nand\na\nin\nthat\nhave\ni")
            
    with open(COMMON_WORDS_PATH, "r", encoding="utf-8") as f:
        return set(line.strip().lower() for line in f if len(line.strip()) > 1)

def main():
    if not os.path.exists(QUESTIONS_JS): return
    
    # Backup
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    with open(BACKUP_JS, "w", encoding="utf-8") as bf:
        bf.write(content)

    start_tag = 'const QUIZ_QUESTIONS = '
    json_str = content[content.find(start_tag) + len(start_tag):].strip()
    if json_str.endswith(";"): json_str = json_str[:-1]
    questions = json.loads(json_str)

    common_words = load_common_words()
    modified_count = 0

    for q in questions:
        # Heuristics
        q_text = q["question"]["text"]
        a_text = q["answer"]["text"]
        
        words_q = q_text.split()
        words_a = a_text.split()
        
        length_score = min(len(words_q) / 30, 1.0)
        
        obscure_count = 0
        for w in words_a:
            clean_w = "".join(c for c in w.lower() if c.isalnum())
            if clean_w and clean_w not in common_words:
                obscure_count += 1
        
        obscurity_score = obscure_count / max(len(words_a), 1)
        
        format_score = 0.2
        if any(keyword in q_text.upper() for keyword in ["CONNECT", "IDENTIFY", "RELATE"]):
            format_score = 1.0
        elif len(words_a) <= 3:
            format_score = 0.5
            
        final_score = (length_score * 0.4) + (obscurity_score * 0.4) + (format_score * 0.2)
        
        old_diff = q.get("difficulty", "medium")
        if final_score < 0.33:
            q["difficulty"] = "easy"
        elif final_score < 0.66:
            q["difficulty"] = "medium"
        else:
            q["difficulty"] = "hard"
            
        if q["difficulty"] != old_diff:
            modified_count += 1

    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const QUIZ_QUESTIONS = ")
        f.write(json.dumps(questions, indent=2))
        f.write(";")

    print(f"Difficulty enrichment complete. Adjusted {modified_count} questions.")

if __name__ == "__main__":
    main()
