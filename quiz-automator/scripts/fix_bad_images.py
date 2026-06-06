"""
fix_bad_images.py — Remove or replace irrelevant Pexels images.

Root cause: Pexels is a stock photo site with no photos of specific people
(Brian Lara, Milkha Singh, etc.). When the answer is a proper-noun name,
Pexels returns a random match (cowboy, mosque, generic person) which looks
like a bug.

Fix:
  1. For each Pexels image whose question answer looks like a proper noun:
     a. Try Wikipedia with multiple query variants (use funda for context)
     b. If Wikipedia returns a thumbnail -> swap to it, delete Pexels file
     c. If not -> delete the bad Pexels file, set image to null
  2. Generic-concept answers (Hibernation, Cricket, Spitfire) keep their
     Pexels images — those are usually fine.

Reports counts. Verifies file still parses as JS.
"""
import os
import re
import ssl
import sys
import json
import time
import shutil
import urllib.parse
import urllib.request
import datetime
import subprocess

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
      "AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0.0.0 Safari/537.36")


def http_json(url, headers=None, timeout=12):
    req = urllib.request.Request(url, headers=dict(headers or {}, **{"User-Agent": UA}))
    ctx = ssl.create_default_context()
    ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return json.loads(r.read().decode("utf-8", errors="replace"))


def http_bytes(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read()


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Wikipedia (multi-variant search) ─────────────────────────────────────────
def wiki_search_then_summary(query):
    """Use Wikipedia search API to find best title, then fetch summary+thumb."""
    if not query: return None
    safe = urllib.parse.quote(query.strip())
    search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={safe}&limit=1&format=json"
    try:
        result = http_json(search_url, timeout=10)
        if not result or len(result) < 2 or not result[1]:
            return None
        title = result[1][0]
    except Exception:
        return None

    safe_title = urllib.parse.quote(title)
    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{safe_title}"
    try:
        return http_json(summary_url, timeout=10)
    except Exception:
        return None


def wiki_thumb(data):
    if not data: return None
    t = data.get("thumbnail")
    return t["source"] if t and t.get("source") else None


# ── Proper-noun detection ────────────────────────────────────────────────────
COMMON_GENERICS = {
    'cricket','football','tennis','golf','rugby','baseball','basketball',
    'aviation','airline','aircraft','plane','helicopter','sniper','sport',
    'wildlife','animal','species','bird','flower','food','dish','recipe',
    'spitfire','baguette','sonar','radar','kamikaze','hibernation','airlift',
    'snake','elephant','tiger','lion','eagle','bear','wolf',
    'movie','film','song','book','novel','poem','article','newspaper','magazine',
    'company','startup','app','website','game','show','series',
}


def is_proper_noun_answer(answer_text):
    """
    True if answer looks like a specific entity (person/place/event/brand)
    rather than a generic concept. Pexels can't help with proper nouns.
    """
    if not answer_text: return False
    plain = re.sub(r"<[^>]+>", "", answer_text).strip().rstrip('.')
    words = plain.split()
    if not words: return False

    # Short multi-cap-word phrases like "Brian Lara", "Olympic Airways"
    cap_words = [w for w in words[:5] if w and w[0].isupper()]
    if len(cap_words) >= 2 and len(words) <= 6:
        # If first word is a generic concept, it's not a proper noun
        first_lower = words[0].lower().strip(".,;:!?")
        if first_lower in COMMON_GENERICS:
            return False
        return True
    # Single name like "Spitfire", "Kamikaze" — these ARE in COMMON_GENERICS
    if len(words) == 1:
        return words[0].lower() not in COMMON_GENERICS
    # Long descriptive answers — extract first 2 cap words as person name
    if len(cap_words) >= 2:
        return True
    return False


def extract_proper_noun(answer_text, funda_text=""):
    """
    Get the most likely proper-noun name from answer + funda context.
    e.g. "Lara of the West Indies, with..." + funda mentioning "Brian Lara"
         → "Brian Lara"
    """
    plain = re.sub(r"<[^>]+>", "", answer_text or "").strip()
    funda_plain = re.sub(r"<[^>]+>", "", funda_text or "").strip()

    # First take the first 2-3 capitalized words from answer
    words = plain.split()
    cap_chunk = []
    for w in words[:6]:
        clean = w.strip(".,;:!?\"'")
        if clean and clean[0].isupper() and clean.lower() not in COMMON_GENERICS:
            cap_chunk.append(clean)
        elif cap_chunk:
            break  # stop at first lowercase
    if not cap_chunk: return None
    primary_name = " ".join(cap_chunk[:3])

    # If primary_name is a single word (likely surname) and we have funda,
    # search funda for "FirstName Surname" pattern
    if len(cap_chunk) == 1 and funda_plain:
        # Look for "X Lara" pattern in funda
        last = cap_chunk[0]
        m = re.search(r'\b([A-Z][a-z]+)\s+' + re.escape(last) + r'\b', funda_plain)
        if m:
            return f"{m.group(1)} {last}"
    return primary_name


# ── Image file management ────────────────────────────────────────────────────
def delete_image_file(image_path, site):
    if not image_path: return
    full = os.path.join(site, image_path.replace("/", os.sep))
    try:
        if os.path.isfile(full):
            os.remove(full)
    except Exception:
        pass


# ── Surgical questions.js editing ────────────────────────────────────────────
OBJ_RE = re.compile(r'\{\s*"id"\s*:\s*\d+[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}', re.DOTALL)


def get_id(b):
    m = re.search(r'"id"\s*:\s*(\d+)', b); return int(m.group(1)) if m else None


def get_nested_text(b, k):
    m = re.search(
        r'"' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*"((?:[^"\\]|\\.)*)"',
        b, re.DOTALL)
    return m.group(1) if m else None


def get_nested_image(b, k):
    m = re.search(
        r'"' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"image"\s*:\s*"([^"]+)"',
        b, re.DOTALL)
    return m.group(1) if m else None


def replace_nested_image(b, k, new_path):
    """Set or null-out the image field. new_path can be string or None (to set null)."""
    pat = re.compile(
        r'("' + re.escape(k) + r'"\s*:\s*\{[^{}]*?"image"\s*:\s*)(?:null|"[^"]*")',
        re.DOTALL)
    if new_path is None:
        return pat.sub(r"\1null", b, count=1)
    esc = new_path.replace("\\", "\\\\").replace('"', '\\"')
    return pat.sub(r'\1"' + esc + r'"', b, count=1)


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    cfg = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path    = os.path.join(site, "data", "questions.js")
    images_dir = os.path.join(site, "images")

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".fix_images_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"Backup: {bak}")

    targets = []
    for m in OBJ_RE.finditer(text):
        b = m.group(0)
        targets.append({
            "qid":   get_id(b),
            "a":     decode(get_nested_text(b, "answer") or ""),
            "f":     decode(get_nested_text(b, "funda")  or ""),
            "img":   get_nested_image(b, "answer"),
            "qtext": decode(get_nested_text(b, "question") or ""),
        })

    print(f"Scanning {len(targets)} questions for bad Pexels images...")

    new_text = text
    stats = {
        "checked": 0,
        "skipped_no_image": 0,
        "skipped_generic_ok": 0,
        "wiki_replaced": 0,
        "deleted_no_replacement": 0,
        "kept_wiki": 0,
    }

    for t in targets:
        if not t["img"]:
            stats["skipped_no_image"] += 1; continue

        is_pexels = "_pexels" in t["img"]
        is_wiki   = "_wiki" in t["img"]
        if is_wiki:
            stats["kept_wiki"] += 1; continue

        if not is_pexels:
            continue

        stats["checked"] += 1

        # Decision: is this answer a proper noun?
        if not is_proper_noun_answer(t["a"]):
            stats["skipped_generic_ok"] += 1
            continue

        # It IS a proper noun → Pexels image is suspicious. Try Wikipedia.
        name = extract_proper_noun(t["a"], t["f"])
        if not name:
            # Just delete the image
            delete_image_file(t["img"], site)
            id_pat = re.compile(
                r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
                re.DOTALL)
            mm = id_pat.search(new_text)
            if mm:
                s, e = mm.span()
                new_text = new_text[:s] + replace_nested_image(mm.group(0), "answer", None) + new_text[e:]
            stats["deleted_no_replacement"] += 1
            print(f"  Q{t['qid']:3d} no-name -> deleted (a: {t['a'][:45]})")
            continue

        # Search Wikipedia
        wdata = wiki_search_then_summary(name)
        time.sleep(0.25)
        new_url = wiki_thumb(wdata)

        if new_url:
            # Download new Wikipedia thumbnail
            fname = f"q{t['qid']}_wiki.jpg"
            dest = os.path.join(images_dir, fname)
            try:
                with open(dest, "wb") as f:
                    f.write(http_bytes(new_url))
                # Delete old Pexels file
                delete_image_file(t["img"], site)
                # Update questions.js
                id_pat = re.compile(
                    r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
                    re.DOTALL)
                mm = id_pat.search(new_text)
                if mm:
                    s, e = mm.span()
                    new_text = new_text[:s] + replace_nested_image(mm.group(0), "answer", f"images/{fname}") + new_text[e:]
                stats["wiki_replaced"] += 1
                print(f"  Q{t['qid']:3d} {name!r} -> wiki photo")
            except Exception as ex:
                print(f"  Q{t['qid']:3d} download fail ({ex}) -> deleting bad Pexels")
                delete_image_file(t["img"], site)
                id_pat = re.compile(
                    r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
                    re.DOTALL)
                mm = id_pat.search(new_text)
                if mm:
                    s, e = mm.span()
                    new_text = new_text[:s] + replace_nested_image(mm.group(0), "answer", None) + new_text[e:]
                stats["deleted_no_replacement"] += 1
        else:
            # Wiki couldn't find them either → delete bad Pexels
            delete_image_file(t["img"], site)
            id_pat = re.compile(
                r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
                re.DOTALL)
            mm = id_pat.search(new_text)
            if mm:
                s, e = mm.span()
                new_text = new_text[:s] + replace_nested_image(mm.group(0), "answer", None) + new_text[e:]
            stats["deleted_no_replacement"] += 1
            print(f"  Q{t['qid']:3d} {name!r} not on wiki -> deleted bad Pexels")

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)

    # Verify
    print("\nVerifying file parses as JS...")
    rc = subprocess.run(
        ["node", "-e",
         "const fs=require('fs');"
         f"const text=fs.readFileSync('{qs_path.replace(chr(92), '/')}','utf8');"
         "new Function(text+'\\nreturn QUIZ_QUESTIONS;')();"
         "console.log('OK');"],
        capture_output=True, text=True)
    if rc.returncode != 0:
        print("FAILED — restoring backup")
        print(rc.stderr[:500])
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print("OK")

    print("\n" + "=" * 60)
    print("BAD IMAGE CLEANUP SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
