# Directive: Quiz Site Automation

## What I want to achieve

I run a quiz website. The HTML file lives at a local path on my computer (configured
in config.json). Right now I manually download quiz files from Slideshare, extract
the questions and answers, find a photo, format everything into HTML, and paste it
into my website. This takes 20–40 minutes per quiz.

I want to drop a quiz file (PDF or PPTX) into a watched folder and have the website
update itself automatically with zero further input from me.

---

## Input

- A quiz file dropped into the `input/` folder (PDF or PPTX)
- The file name is used as a fallback quiz title if none is found inside the document
- Files can contain: question text, multiple-choice options (A/B/C/D), correct answer,
  and optionally a quiz category/topic

---

## What the automation must do, in order

1. **Detect** the new file in the input folder (poll every 30 seconds)
2. **Extract** all quiz questions, answer options, correct answers, and quiz title/category
3. **Fetch one image** from Pexels API using the quiz topic as search term
4. **Build an HTML card** using the quiz_card.html template filled with extracted data
5. **Inject** the new card into index.html above the `<!-- END_QUIZZES -->` marker
6. **Save** the updated index.html (with .bak backup first)
7. **Archive** the processed quiz file to `processed/` folder
8. **Log** all steps with timestamps

---

## Output

- Updated `index.html` with the new quiz card injected at the top of the quiz list
- A backup file `index.html.bak` in the same folder
- Archived source file in `processed/`
- A log entry in `logs/automation.log`

---

## Constraints

- Free APIs only: Pexels (free tier, API key in config), no paid services
- Must work fully offline except for the image fetch step
- Must not require me to touch any code, terminal, or configuration after initial setup
- The watcher must run continuously in the background (as a Python process or service)
