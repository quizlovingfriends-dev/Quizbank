"""
fix_data_bugs.py — Surgical data fixes for data/questions.js.

Uses targeted regex replacements directly on the raw file text — does NOT
round-trip through json.loads/json.dumps (which can break borderline-valid
escape sequences in OCR-derived strings).

Fixes:
  1. Strips "[ATTACH IMAGE...]" / "[attach image]" markers from any field text
  2. Re-classifies questions to correct topic via expanded keyword dictionary
  3. Sets q.type = "progressive" for multi-clue questions
  4. Strips trailing em-dashes / replacement chars from answer text

Always creates a backup first. Verifies the file still parses as JS at the end.
"""
import os
import re
import sys
import json
import shutil
import datetime
import subprocess

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Topic re-classification ──────────────────────────────────────────────────
TOPIC_KEYWORDS = {
    'sports': [
        'cricket','football','olympic','wickets','batsman','bowler','ipl','test match',
        'fifa','tennis','wimbledon','grand slam','captain','world cup','stadium',
        'league','baseball','basketball','golf','marathon','kohli','dhoni','ashwin',
        'nadal','federer','messi','ronaldo','tendulkar','sachin','rohit sharma',
        'virat','rower','rowing','sprinter','sprint','spitfire','airline','airport',
        'aircraft','aviation','pilot','airbus','olympic airways','top gun','maverick',
        'kamikaze','snipe','sniper','korean air','delta airlines','air koryo',
        'smoker','table tennis','badminton','hockey','rugby','india cements',
    ],
    'wildlife': [
        'animal','species','tiger','lion','eagle','sonar','radar','penguin',
        'biomimicry','forest','ecosystem','flora','fauna','endemic','butterfly',
        'whale','elephant','reptile','marine','snake','spider','dolphin','wildlife',
        'electric eel','flamingo','raptor','predator','serpent','wolves','wolf',
        'hibernation','migration','poaching','rhinoceros','venom','venomous',
        'lake natron','calcified','bird of prey','birds of prey',
    ],
    'history': [
        'world war','ww2','ww1','1915','1947','empire','ancient','dynasty',
        'colonial','revolution','poet','frost','robert frost','jayadeva','gandhi',
        'nehru','partition','mughal','viking','mahabharat','ramayan','ashoka',
        'akbar','chola','pallava','mahendravarman','indus','harappan','medieval',
        'naval aviation','dunkirk','world war ii','shaken not stirred',
        'biju patnaik','queen elizabeth','victorian','edwardian','renaissance',
        'venus de milo','aphrodite','iliad','odyssey','homer','goa',
    ],
    'politics': [
        'minister','prime minister','president','election','parliament','treaty',
        'duke','duchess','sussex','meghan','harry','modi','biden','trump',
        'putin','zelensky','bolsonaristas','government','congress','senator',
        'rajya sabha','lok sabha','independence','constitution',
    ],
    'cuisines': [
        ' dish','food','recipe','baguette','restaurant','chef','spice',
        'ingredient','cuisine','michelin','wine','dessert','breakfast',
        'street food','gourmet','culinary',
    ],
    'current-affairs': [
        '2024','2025','recent','launched','announced','elected','signed',
        'metaverse','startup','unicorn','zerodha','nft','generative ai',
        'chatgpt','blockchain','crypto','isro','chandrayaan',
    ],
}


def detect_topic(q_text, a_text, current_topic):
    combined = (q_text + ' ' + a_text).lower()
    scores = {t: sum(1 for kw in kws if kw in combined) for t, kws in TOPIC_KEYWORDS.items()}
    best = max(scores, key=scores.get)
    if scores[best] >= 2:
        return best
    if scores[best] == 1 and current_topic == 'general':
        return best
    return current_topic


def is_progressive(q_text):
    """Multi-clue questions become progressive-reveal."""
    if not q_text: return False
    t = q_text.replace('\\n', '\n')
    sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', t) if s.strip()]

    # 3+ sentences each substantial (>15 chars) → progressive
    if len(sentences) >= 3 and sum(1 for s in sentences if len(s) > 15) >= 3:
        return True
    # 2 sentences where the second is a question
    if len(sentences) >= 2 and sentences[-1].endswith('?') and len(sentences[0]) > 25:
        return True
    # Multi-line with explicit hint markers
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    if len(lines) >= 3:
        return True
    if re.search(r'CLUE\s*\d+', t, re.IGNORECASE):
        return True
    return False


# ── Per-object surgery ───────────────────────────────────────────────────────

OBJ_RE = re.compile(r'\{\s*"id"\s*:\s*\d+[^{}]*?(?:\{[^{}]*\}[^{}]*?)*\}', re.DOTALL)


def get_field_value(block, field):
    """Extract a top-level string field value: e.g. topic, type."""
    m = re.search(r'"' + re.escape(field) + r'"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', block)
    return m.group(1) if m else None


def get_nested_text(block, outer):
    """Get inner text from { "outer": { "text": "...", ... } }."""
    m = re.search(
        r'"' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*"((?:[^"\\]|\\.)*)"',
        block, re.DOTALL,
    )
    return m.group(1) if m else None


def replace_nested_text(block, outer, new_value):
    """Replace { "outer": { "text": "OLD" } } with new value (escape new)."""
    esc = new_value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    pat = re.compile(
        r'("' + re.escape(outer) + r'"\s*:\s*\{[^{}]*?"text"\s*:\s*)"((?:[^"\\]|\\.)*)"',
        re.DOTALL,
    )
    new_block, n = pat.subn(r'\1"' + esc + r'"', block, count=1)
    return new_block, n > 0


def replace_top_field(block, field, new_value):
    esc = new_value.replace('\\', '\\\\').replace('"', '\\"')
    pat = re.compile(r'("' + re.escape(field) + r'"\s*:\s*)"([^"\\]*(?:\\.[^"\\]*)*)"')
    if pat.search(block):
        return pat.sub(r'\1"' + esc + r'"', block, count=1), True
    # Field doesn't exist — inject after id
    pat_id = re.compile(r'("id"\s*:\s*\d+\s*,)')
    if pat_id.search(block):
        injection = '"' + field + '": "' + esc + '",'
        return pat_id.sub(r'\1\n    ' + injection, block, count=1), True
    return block, False


def strip_attach(text):
    if not text: return text
    cleaned = re.sub(r'\s*\[ATTACH[^\]]*\]\s*', ' ', text, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', cleaned).strip()


def strip_trailing_junk(text):
    if not text: return text
    s = re.sub(r'\s+[-—–_]{1,}\s*$', '', text)
    s = s.replace('�', '').strip()
    return s


def main():
    cfg = load_config()
    site = cfg.get('site_folder', '').strip()
    qs_path = os.path.join(site, 'data', 'questions.js')

    with open(qs_path, 'r', encoding='utf-8', errors='replace') as f:
        text = f.read()

    stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    bak = qs_path + f'.fix_bugs_{stamp}.bak'
    shutil.copy2(qs_path, bak)
    print(f'Backed up to {bak}')

    fixed = {'attach': 0, 'topic': 0, 'progressive': 0, 'trailing_junk': 0}
    notes = []

    def fix_block(block):
        original = block
        qid_m = re.search(r'"id"\s*:\s*(\d+)', block)
        qid = int(qid_m.group(1)) if qid_m else 0

        # Pull current values
        q_text  = get_nested_text(block, 'question') or ''
        a_text  = get_nested_text(block, 'answer')   or ''
        f_text  = get_nested_text(block, 'funda')    or ''
        topic   = get_field_value(block, 'topic') or 'general'
        qtype   = get_field_value(block, 'type')  or 'standard'

        # Decode \" and \n from the JS string to plaintext for analysis
        decode = lambda s: s.replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')
        q_dec, a_dec, f_dec = map(decode, (q_text, a_text, f_text))

        new_q, new_a, new_f = q_dec, a_dec, f_dec

        # 1. Strip [ATTACH...]
        for label, val_old in (('Q', q_dec), ('A', a_dec), ('F', f_dec)):
            if '[attach' in val_old.lower():
                cleaned = strip_attach(val_old)
                if label == 'Q': new_q = cleaned
                elif label == 'A': new_a = cleaned
                else:               new_f = cleaned
                fixed['attach'] += 1
                notes.append(f'  Q{qid} ({label}): stripped [ATTACH] marker')

        # 2. Strip trailing junk from answer
        cleaned_a = strip_trailing_junk(new_a)
        if cleaned_a != new_a:
            new_a = cleaned_a
            fixed['trailing_junk'] += 1

        # 3. Apply text changes
        if new_q != q_dec:
            block, _ = replace_nested_text(block, 'question', new_q)
        if new_a != a_dec:
            block, _ = replace_nested_text(block, 'answer', new_a)
        if new_f != f_dec:
            block, _ = replace_nested_text(block, 'funda', new_f)

        # 4. Re-classify topic
        new_topic = detect_topic(new_q, new_a, topic)
        if new_topic != topic:
            block, _ = replace_top_field(block, 'topic', new_topic)
            fixed['topic'] += 1
            notes.append(f'  Q{qid}: topic {topic!r} -> {new_topic!r}')

        # 5. Set type=progressive
        if is_progressive(new_q) and qtype != 'progressive':
            block, _ = replace_top_field(block, 'type', 'progressive')
            fixed['progressive'] += 1
            notes.append(f'  Q{qid}: type {qtype!r} -> progressive')

        return block

    new_text = OBJ_RE.sub(lambda m: fix_block(m.group(0)), text)

    # Write
    with open(qs_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(new_text)

    # Verify with Node — make sure file is still valid JS
    print('\nVerifying file parses as JavaScript...')
    rc = subprocess.run(
        ['node', '-e', f'''
const fs = require("fs");
const text = fs.readFileSync("{qs_path.replace(chr(92), "/")}", "utf8");
new Function(text + "\\nreturn QUIZ_QUESTIONS;")();
console.log("OK");
'''],
        capture_output=True, text=True,
    )
    if rc.returncode != 0:
        print('FAILED — file is not valid JS! Restoring backup.')
        print(rc.stderr[:500])
        shutil.copy2(bak, qs_path)
        sys.exit(1)
    print('OK — JS parses cleanly.')

    print('\n' + '=' * 60)
    print('FIX SUMMARY')
    print('=' * 60)
    for k, v in fixed.items():
        print(f'  {k}: {v}')
    print()
    if notes:
        print(f'Notes (showing first 30 of {len(notes)}):')
        for n in notes[:30]:
            print(n)
    print(f'\nWritten to {qs_path}')
    print(f'Backup at  {bak}')


if __name__ == '__main__':
    main()
