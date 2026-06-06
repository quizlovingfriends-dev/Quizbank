"""
enrich_all.py — Wikipedia fundas + Pexels answer images, in one pass.

For each question in data/questions.js:
  - if funda.text empty -> fetch Wikipedia summary for the answer, use first sentence
  - if answer.image null -> fetch Wikipedia thumbnail (free), fallback to Pexels

Always backs up first. Verifies the file still parses as JS at the end and
auto-rolls back if not.

Flags:
  --no-pexels   skip Pexels even if key is configured
  --no-wiki     skip Wikipedia entirely
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


def http_json(url, headers=None, timeout=15):
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


# ── Wikipedia ────────────────────────────────────────────────────────────────
def wiki_lookup(query):
    if not query: return None
    safe = urllib.parse.quote(query.strip())
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{safe}"
    try:
        return http_json(url, timeout=10)
    except Exception:
        return None


def wiki_summary_first_sentence(data):
    if not data or data.get("type") == "disambiguation": return None
    extract = (data.get("extract") or "").strip()
    if len(extract) < 60: return None
    first = re.split(r"(?<=[.!?])\s+", extract)[0]
    return first[:280] if first else None


def wiki_thumb(data):
    if not data: return None
    t = data.get("thumbnail")
    return t["source"] if t and t.get("source") else None


# ── Pexels ───────────────────────────────────────────────────────────────────
def pexels_image_url(api_key, query):
    safe = urllib.parse.quote(query.strip())
    url  = f"https://api.pexels.com/v1/search?query={safe}&per_page=1&orientation=landscape"
    try:
        data = http_json(url, headers={"Authorization": api_key}, timeout=15)
    except Exception:
        return None
    photos = data.get("photos", [])
    if not photos: return None
    src = photos[0].get("src", {})
    return src.get("large") or src.get("medium") or src.get("original")


def download_image(url, dest_path):
    try:
        with open(dest_path, "wb") as f:
            f.write(http_bytes(url))
        return True
    except Exception as e:
        print(f"    download failed: {e}")
        return False


# ── Surgical regex ───────────────────────────────────────────────────────────
def get_id(block):
    m = re.search(r'"id"\s*:\s*(\d+)', block)
    return int(m.group(1)) if m else None


def get_nested_text(block, outer):
    m = re.search(
        r'"' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*"((?:[^"\\]|\\.)*)"',
        block, re.DOTALL,
    )
    return m.group(1) if m else None


def get_nested_image(block, outer):
    m = re.search(
        r'"' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"image"\s*:\s*"([^"]+)"',
        block, re.DOTALL,
    )
    return m.group(1) if m else None


def replace_nested_text(block, outer, new_value):
    esc = new_value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    pat = re.compile(
        r'("' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*)"((?:[^"\\]|\\.)*)"',
        re.DOTALL,
    )
    return pat.sub(r'\1"' + esc + r'"', block, count=1)


def replace_nested_image(block, outer, new_path):
    esc = new_path.replace("\\", "\\\\").replace('"', '\\"')
    pat = re.compile(
        r'("' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"image"\s*:\s*)(?:null|"[^"]*")',
        re.DOTALL,
    )
    return pat.sub(r'\1"' + esc + r'"', block, count=1)


def decode(s):
    return (s or "").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')


def query_from_answer(text):
    plain = re.sub(r"<[^>]+>", "", text or "").strip()
    plain = re.sub(r"[^\w\s'-]", " ", plain)
    words = [w for w in plain.split() if len(w) >= 2]
    return " ".join(words[:4])


# ── Main ─────────────────────────────────────────────────────────────────────
OBJ_RE = re.compile(r'\{\s*"id"\s*:\s*\d+[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}', re.DOTALL)


def main():
    cfg  = load_config()
    site = cfg.get("site_folder", "").strip()
    qs_path    = os.path.join(site, "data", "questions.js")
    images_dir = os.path.join(site, "images")
    os.makedirs(images_dir, exist_ok=True)
    pexels_key = (cfg.get("pexels_api_key", "") or "").strip()

    skip_pexels = "--no-pexels" in sys.argv or not pexels_key
    skip_wiki   = "--no-wiki"   in sys.argv

    with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = qs_path + f".enrich_{stamp}.bak"
    shutil.copy2(qs_path, bak)
    print(f"Backup: {bak}")

    blocks = list(OBJ_RE.finditer(text))
    print(f"Found {len(blocks)} questions in file")
    if skip_pexels: print("Skipping Pexels")
    if skip_wiki:   print("Skipping Wikipedia")

    targets = []
    for m in blocks:
        block = m.group(0)
        targets.append({
            "qid":          get_id(block),
            "answer_text":  decode(get_nested_text(block, "answer")  or ""),
            "funda_text":   decode(get_nested_text(block, "funda")   or ""),
            "answer_image": get_nested_image(block, "answer"),
        })

    new_text = text
    stats = {"funda_added": 0, "wiki_image": 0, "pexels_image": 0,
             "wiki_no_match": 0, "pexels_no_match": 0, "skipped": 0}

    for i, t in enumerate(targets):
        if not t["answer_text"]:
            stats["skipped"] += 1; continue
        query = query_from_answer(t["answer_text"])
        if not query: continue

        funda_to_set = None
        image_to_set = None

        # Wikipedia lookup (used for both funda and image)
        wdata = None
        if not skip_wiki:
            wdata = wiki_lookup(query)
            time.sleep(0.2)

        # Funda
        if (not t["funda_text"].strip() or len(t["funda_text"]) < 30) and wdata:
            s = wiki_summary_first_sentence(wdata)
            if s:
                funda_to_set = s
                stats["funda_added"] += 1
            else:
                stats["wiki_no_match"] += 1

        # Image: Wikipedia thumbnail first, then Pexels
        if not t["answer_image"]:
            wimg = wiki_thumb(wdata) if wdata else None
            if wimg:
                fname = f"q{t['qid']}_wiki.jpg"
                if download_image(wimg, os.path.join(images_dir, fname)):
                    image_to_set = f"images/{fname}"
                    stats["wiki_image"] += 1
            elif not skip_pexels:
                purl = pexels_image_url(pexels_key, query)
                time.sleep(0.4)
                if purl:
                    fname = f"q{t['qid']}_pexels.jpg"
                    if download_image(purl, os.path.join(images_dir, fname)):
                        image_to_set = f"images/{fname}"
                        stats["pexels_image"] += 1
                else:
                    stats["pexels_no_match"] += 1

        # Apply edits — re-find block in evolving new_text
        if funda_to_set or image_to_set:
            id_pat = re.compile(
                r'\{\s*"id"\s*:\s*' + str(t["qid"]) + r'\b[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}',
                re.DOTALL,
            )
            mm = id_pat.search(new_text)
            if not mm: continue
            s, e = mm.span()
            block = mm.group(0)
            if funda_to_set:
                block = replace_nested_text(block, "funda", funda_to_set)
            if image_to_set:
                block = replace_nested_image(block, "answer", image_to_set)
            new_text = new_text[:s] + block + new_text[e:]

        if (i + 1) % 10 == 0:
            print(f"  {i+1}/{len(targets)}  fundas={stats['funda_added']} "
                  f"wiki_img={stats['wiki_image']} pexels_img={stats['pexels_image']}")

    with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_text)

    # Verify with Node
    print("\nVerifying file parses as JS...")
    rc = subprocess.run(
        ["node", "-e",
         "const fs=require('fs');"
         f"const text=fs.readFileSync('{qs_path.replace(chr(92), '/')}','utf8');"
         "new Function(text+'\\nreturn QUIZ_QUESTIONS;')();"
         "console.log('OK');"],
        capture_output=True, text=True,
    )
    if rc.returncode != 0:
        print("FAILED — restoring backup")
        print(rc.stderr[:500])
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print("OK")

    print("\n" + "=" * 60)
    print("ENRICHMENT SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
