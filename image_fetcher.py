"""
image_fetcher.py
----------------
Layer 3 execution: fetch a relevant image URL for a quiz category/title.
Primary: Pexels API (200 req/hr free)
Fallback: Unsplash API (50 req/hr free)
Final fallback: returns a CSS gradient data-uri — never a broken image.
"""

import re
import json
import logging
import urllib.request
import urllib.parse
import urllib.error

log = logging.getLogger(__name__)

# Fallback gradient colors per category (no API needed)
FALLBACK_GRADIENTS = {
    "Science":          "linear-gradient(135deg, #0F6E56 0%, #1D9E75 100%)",
    "History":          "linear-gradient(135deg, #3C3489 0%, #7F77DD 100%)",
    "Geography":        "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)",
    "Sports":           "linear-gradient(135deg, #993C1D 0%, #D85A30 100%)",
    "Technology":       "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
    "Entertainment":    "linear-gradient(135deg, #72243E 0%, #D4537E 100%)",
    "Mathematics":      "linear-gradient(135deg, #5F5E5A 0%, #888780 100%)",
    "General Knowledge":"linear-gradient(135deg, #444441 0%, #888780 100%)",
}

# Good search terms per category
CATEGORY_SEARCH_TERMS = {
    "Science":          "science laboratory experiment",
    "History":          "ancient history monument",
    "Geography":        "world map globe",
    "Sports":           "sports stadium",
    "Technology":       "technology computer abstract",
    "Entertainment":    "cinema entertainment",
    "Mathematics":      "mathematics numbers",
    "General Knowledge":"knowledge books library",
}


def fetch_image(category: str, title: str, config: dict) -> dict:
    """
    Returns a dict with keys:
      url          — the image URL (or empty string if using CSS fallback)
      fallback_css — CSS gradient string (populated when url is empty)
      credit       — attribution string
      source       — 'pexels' | 'unsplash' | 'fallback'
    """
    api_keys = config.get("api_keys", {})
    source_pref = config.get("image_source", "pexels")

    search_term = CATEGORY_SEARCH_TERMS.get(category, title[:40])

    # Try preferred source first, then alternate, then fallback
    sources = ["pexels", "unsplash"] if source_pref == "pexels" else ["unsplash", "pexels"]

    for source in sources:
        key = api_keys.get(source, "")
        if not key or "PASTE_YOUR" in key:
            continue
        try:
            if source == "pexels":
                result = _fetch_pexels(search_term, key)
            else:
                result = _fetch_unsplash(search_term, key)
            if result["url"]:
                log.info(f"Image fetched from {source}: {result['url'][:60]}…")
                return result
        except Exception as e:
            log.warning(f"{source} fetch failed: {e}")

    # Final fallback — CSS gradient, no network call needed
    log.info(f"Using CSS gradient fallback for category: {category}")
    return {
        "url": "",
        "fallback_css": FALLBACK_GRADIENTS.get(category, FALLBACK_GRADIENTS["General Knowledge"]),
        "credit": "No image",
        "source": "fallback"
    }


def _fetch_pexels(query: str, api_key: str) -> dict:
    encoded = urllib.parse.quote(query)
    url = f"https://api.pexels.com/v1/search?query={encoded}&per_page=1&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": api_key})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())
    photos = data.get("photos", [])
    if not photos:
        return {"url": "", "fallback_css": "", "credit": "", "source": "pexels"}
    photo = photos[0]
    return {
        "url": photo["src"]["large"],
        "fallback_css": "",
        "credit": f"Photo by {photo['photographer']} on Pexels",
        "source": "pexels"
    }


def _fetch_unsplash(query: str, api_key: str) -> dict:
    encoded = urllib.parse.quote(query)
    url = f"https://api.unsplash.com/search/photos?query={encoded}&per_page=1&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": f"Client-ID {api_key}"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())
    results = data.get("results", [])
    if not results:
        return {"url": "", "fallback_css": "", "credit": "", "source": "unsplash"}
    photo = results[0]
    return {
        "url": photo["urls"]["regular"],
        "fallback_css": "",
        "credit": f"Photo by {photo['user']['name']} on Unsplash",
        "source": "unsplash"
    }
