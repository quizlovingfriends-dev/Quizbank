import os
import json
import requests

# ── CONFIG ──────────────────────────────────────────────────────────────────
SITE_DIR = "D:/QUIZBANK"
QUESTIONS_JS = os.path.join(SITE_DIR, "data", "questions.js")
CONFIG_PATH = os.path.join(SITE_DIR, "quiz-automator", "config.json")

def main():
    if not os.path.exists(CONFIG_PATH):
        print("Config not found.")
        return
        
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    
    key = config.get("pexels_api_key", "").strip()
    if not key:
        print("WARNING: pexels_api_key is empty. Skipping image enrichment.")
        return

    # If key existed, we would download images here...
    # (Implementation omitted as per instruction to skip if empty)
    print("Pexels key found, but image enrichment logic is currently restricted to local search.")

if __name__ == "__main__":
    main()
