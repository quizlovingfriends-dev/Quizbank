"""
image_fetcher.py — Fetch a relevant image URL from Pexels.
Usage: python scripts/image_fetcher.py <topic> <search_query>
Output: URL string or "null" to stdout
"""
import sys
import os
import json
import urllib.request
import urllib.parse

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def fetch_image(category, query):
    try:
        config = load_config()
    except Exception:
        print("null")
        return

    api_key = config.get("pexels_api_key", "").strip()
    if not api_key:
        print("null")
        return

    # Use first 6 words of query
    words   = query.split()[:6]
    q_param = " ".join(words) if words else category
    encoded = urllib.parse.quote(q_param)
    url     = f"https://api.pexels.com/v1/search?query={encoded}&per_page=1&orientation=landscape"

    try:
        req = urllib.request.Request(url, headers={"Authorization": api_key})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        photos = data.get("photos", [])
        if photos:
            photo_url = photos[0].get("src", {}).get("large", None)
            print(photo_url if photo_url else "null")
        else:
            print("null")
    except Exception:
        print("null")


def main():
    category = sys.argv[1] if len(sys.argv) > 1 else "general"
    query    = sys.argv[2] if len(sys.argv) > 2 else category
    fetch_image(category, query)


if __name__ == "__main__":
    main()
