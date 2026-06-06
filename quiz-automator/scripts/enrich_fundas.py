import os
import json
import requests
import time
import re
from urllib.parse import quote

# ── CONFIG ──────────────────────────────────────────────────────────────────
SITE_DIR = "D:/QUIZBANK"
QUESTIONS_JS = os.path.join(SITE_DIR, "data", "questions.js")
BACKUP_JS = os.path.join(SITE_DIR, "data", "questions.js.pre_phase2.bak")

def load_questions():
    if not os.path.exists(QUESTIONS_JS):
        return []
    with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple extraction of the JSON array from questions.js
    start_tag = 'const QUIZ_QUESTIONS = '
    if start_tag not in content:
        return []
    
    json_str = content[content.find(start_tag) + len(start_tag):].strip()
    if json_str.endswith(";"):
        json_str = json_str[:-1]
    
    return json.loads(json_str)

def save_questions(questions):
    # Backup first
    if not os.path.exists(BACKUP_JS):
        with open(QUESTIONS_JS, "r", encoding="utf-8") as f:
            with open(BACKUP_JS, "w", encoding="utf-8") as bf:
                bf.write(f.read())
    
    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const QUIZ_QUESTIONS = ")
        f.write(json.dumps(questions, indent=2))
        f.write(";")

def get_wiki_summary(topic):
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(topic)}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("type") == "disambiguation":
                return None, None
            extract = data.get("extract", "")
            # Take the first sentence
            first_sentence = extract.split(". ")[0] + "." if ". " in extract else extract
            thumb = data.get("thumbnail", {}).get("source") if "thumbnail" in data else None
            return first_sentence, thumb
    except Exception:
        pass
    return None, None

def main():
    questions = load_questions()
    if not questions:
        print("No questions found.")
        return

    enriched_count = 0
    skipped_count = 0
    
    print(f"Enriching fundas for {len(questions)} questions...")
    
    for q in questions:
        funda_text = q.get("funda", {}).get("text", "")
        if not funda_text or len(funda_text) < 30:
            # Extract topic: first 4 words of answer, strip HTML
            answer_clean = re.sub(r'<[^>]+>', '', q["answer"]["text"])
            topic = " ".join(answer_clean.split()[:4])
            
            if not topic:
                skipped_count += 1
                continue
            
            print(f"  [ID {q['id']}] Searching Wiki for: {topic}...")
            summary, thumb = get_wiki_summary(topic)
            
            if summary and len(summary) > 40:
                q["funda"]["text"] = summary
                if thumb and not q["funda"].get("image"):
                    q["funda"]["image"] = thumb
                enriched_count += 1
                print(f"    [OK] Found: {summary[:50]}...")
            else:
                skipped_count += 1
            
            time.sleep(0.2) # Be polite to Wikipedia

    save_questions(questions)
    print(f"\nEnriched {enriched_count} of {len(questions)} questions, skipped {skipped_count}.")

if __name__ == "__main__":
    main()
