"""
html_builder.py
---------------
Layer 3 execution: render a quiz card HTML block from extracted data + image.
Uses Jinja2 if available, falls back to str.format() templating.
"""

import re
import uuid
import logging
from datetime import date
from pathlib import Path

log = logging.getLogger(__name__)


def build_card(quiz_data: dict, image_info: dict, template_path: str) -> str:
    """
    Render a single quiz card HTML block.

    quiz_data   — QuizData.to_dict() output
    image_info  — from image_fetcher.fetch_image()
    template_path — path to quiz_card.html Jinja2 template
    """
    quiz_id = "q" + uuid.uuid4().hex[:8]
    today = date.today().strftime("%B %d, %Y")
    question_count = len(quiz_data.get("questions", []))

    # Determine image / fallback display
    img_url = image_info.get("url", "")
    fallback_css = image_info.get("fallback_css", "#444")
    fallback_color = _extract_first_color(fallback_css)

    # Try Jinja2 template first
    try:
        from jinja2 import Environment, FileSystemLoader, select_autoescape
        template_dir = str(Path(template_path).parent)
        template_name = Path(template_path).name
        env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(["html"])
        )
        tmpl = env.get_template(template_name)
        html = tmpl.render(
            quiz_id=quiz_id,
            quiz_title=quiz_data.get("title", "Quiz"),
            category=quiz_data.get("category", "General Knowledge"),
            question_count=question_count,
            questions=quiz_data.get("questions", []),
            image_url=img_url,
            fallback_color=fallback_color,
            date_added=today,
            generated_at=date.today().isoformat(),
            credit=image_info.get("credit", "")
        )
        log.info("HTML card rendered via Jinja2")
        return html

    except ImportError:
        log.warning("Jinja2 not found — using built-in renderer")
        return _render_builtin(
            quiz_id, quiz_data, img_url, fallback_color, fallback_css, today, question_count
        )


def _render_builtin(quiz_id, quiz_data, img_url, fallback_color, fallback_css, today, q_count):
    """Pure-Python fallback renderer — no dependencies."""
    questions_html = ""
    for i, q in enumerate(quiz_data.get("questions", []), 1):
        opts_html = ""
        for opt in q.get("options", []):
            is_correct = opt.get("letter", "") == q.get("correct_answer", "")
            cls = " quiz-question__option--correct" if is_correct else ""
            opts_html += (
                f'<li class="quiz-question__option{cls}" data-letter="{opt["letter"]}">'
                f'<span class="option-letter">{opt["letter"]}</span>'
                f'<span class="option-text">{_esc(opt["text"])}</span>'
                f'</li>\n'
            )
        questions_html += f"""
        <div class="quiz-question" data-index="{i}">
          <p class="quiz-question__text"><strong>Q{i}.</strong> {_esc(q['question'])}</p>
          <ul class="quiz-question__options">{opts_html}</ul>
          <div class="quiz-question__answer" style="display:none">
            <strong>Answer:</strong> {_esc(q.get('correct_answer',''))}
          </div>
        </div>"""

    img_style = f'style="background:{fallback_css}"' if not img_url else ""
    img_src = f'src="{img_url}"' if img_url else ""

    title = _esc(quiz_data.get("title", "Quiz"))
    category = _esc(quiz_data.get("category", "General Knowledge"))

    return f"""<!-- QUIZ CARD: {title} | Generated: {today} -->
<div class="quiz-card" id="{quiz_id}" data-category="{category}">
  <div class="quiz-card__image-wrap" {img_style}>
    {'<img ' + img_src + ' alt="' + category + ' quiz" loading="lazy">' if img_url else ''}
    <span class="quiz-card__category-badge">{category}</span>
  </div>
  <div class="quiz-card__body">
    <h2 class="quiz-card__title">{title}</h2>
    <p class="quiz-card__meta">{q_count} questions &bull; Added {today}</p>
    <div class="quiz-card__questions">{questions_html}</div>
    <button class="quiz-card__reveal-btn" onclick="toggleAnswers('{quiz_id}')">Show Answers</button>
  </div>
</div>
<script>
if(!window._qaFn){{window._qaFn=true;window.toggleAnswers=function(id){{
  const c=document.getElementById(id);
  c.querySelectorAll('.quiz-question__answer').forEach(e=>e.style.display=e.style.display==='none'?'block':'none');
  const b=c.querySelector('.quiz-card__reveal-btn');
  b.textContent=b.textContent==='Show Answers'?'Hide Answers':'Show Answers';
}};}}
</script>
<!-- END QUIZ CARD: {title} -->
"""


def _esc(text: str) -> str:
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;"))


def _extract_first_color(css_gradient: str) -> str:
    """Pull the first hex color from a CSS gradient string."""
    m = re.search(r"(#[0-9a-fA-F]{3,6})", css_gradient)
    return m.group(1) if m else "#444441"
