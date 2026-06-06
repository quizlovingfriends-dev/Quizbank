"""
html_builder.py — Generate a preview HTML file from extracted quiz JSON.
Usage:
    python scripts/html_builder.py <json_file>
    cat extracted.json | python scripts/html_builder.py
Output: ./preview.html
"""
import sys
import os
import json
import html as html_lib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
OUTPUT     = os.path.join(ROOT_DIR, "preview.html")

TOPIC_COLORS = {
    "sports":          "#e74c3c",
    "wildlife":        "#27ae60",
    "history":         "#8e44ad",
    "politics":        "#2980b9",
    "cuisines":        "#e67e22",
    "current-affairs": "#16a085",
    "general":         "#7f8c8d",
}


def esc(text):
    return html_lib.escape(str(text))


def build_html(data):
    title  = esc(data.get("title", "Quiz Preview"))
    qs     = data.get("questions", [])
    count  = len(qs)

    cards = []
    for i, q in enumerate(qs, 1):
        topic  = q.get("topic", "general")
        color  = TOPIC_COLORS.get(topic, "#7f8c8d")
        qt     = esc(q.get("question_text", ""))
        at     = esc(q.get("answer_text", ""))
        ft     = esc(q.get("funda_text", ""))
        cards.append(f"""
  <div class="card">
    <div class="card-header">
      <span class="num">Q{i}</span>
      <span class="badge" style="background:{color}">{esc(topic)}</span>
    </div>
    <div class="section label">QUESTION</div>
    <div class="section-body">{qt}</div>
    <div class="section label answer-label">ANSWER</div>
    <div class="section-body answer-body">{at}</div>
    {'<div class="section label funda-label">FUNDA</div><div class="section-body funda-body">' + ft + '</div>' if ft else ''}
  </div>""")

    cards_html = "\n".join(cards)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Preview</title>
<style>
  *, *::before, *::after {{ box-sizing: border-box; }}
  body {{
    margin: 0; padding: 24px;
    background: #0f1117; color: #e0e0e0;
    font-family: system-ui, sans-serif; font-size: 15px;
  }}
  h1 {{ color: #fff; margin-bottom: 4px; }}
  .meta {{ color: #888; margin-bottom: 28px; }}
  .card {{
    background: #1a1d27; border: 1px solid #2a2d3a;
    border-radius: 12px; padding: 20px 24px;
    margin-bottom: 18px;
  }}
  .card-header {{ display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }}
  .num {{ font-size: 18px; font-weight: 700; color: #fff; }}
  .badge {{
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    padding: 3px 10px; border-radius: 999px; color: #fff;
    letter-spacing: .5px;
  }}
  .label {{
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #666; margin-top: 10px;
  }}
  .answer-label {{ color: #2ecc71; }}
  .funda-label  {{ color: #f39c12; }}
  .section-body {{ margin-top: 4px; line-height: 1.6; }}
  .answer-body  {{ color: #2ecc71; }}
  .funda-body   {{ color: #f39c12; font-style: italic; }}
</style>
</head>
<body>
<h1>{title}</h1>
<p class="meta">{count} question{'s' if count != 1 else ''} extracted &nbsp;·&nbsp; Preview only — not yet saved to questions.js</p>
{cards_html}
</body>
</html>
"""


def main():
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        raw = sys.stdin.read().strip()
        if not raw:
            print("No input provided.", file=sys.stderr)
            sys.exit(1)
        data = json.loads(raw)

    html_content = build_html(data)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(OUTPUT)


if __name__ == "__main__":
    main()
