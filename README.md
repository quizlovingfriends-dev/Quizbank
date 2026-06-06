# QuizVault

A brutalist GK question bank with smart practice mode, OCR-powered automation pipeline, and AI-enriched content. Built as a one-person project to scratch a daily-quizzing itch.

**[🌐 Live Demo](https://quizvault.netlify.app/)** &nbsp;·&nbsp; **[💻 Source](https://github.com/YOUR_GITHUB/quizvault)**

---

## What it is

QuizVault is a static site with a Python automation layer behind it. Drop a PDF or PPTX quiz file into a folder, and the pipeline extracts the questions, OCRs image-based slides, validates the content, fetches relevant images from Wikipedia and Pexels, generates AI fundas via GitHub Models, and appends everything to a single JS data file. The frontend reads that file and renders a Brutalist-themed question bank with practice mode, spaced repetition, cloud sync, and analytics.

## Features

### Content
- **200+ curated questions** across 7 topics with images, fundas, and difficulty ratings
- **AI-generated fundas** for every question, written by GPT-4o-mini via GitHub Models
- **Auto-fetched images** from Wikipedia (specific entities) + Pexels (concepts)
- **Auto-detected topic and difficulty** via keyword heuristics

### Practice mode
- Type-and-verify answer matching with fuzzy / Levenshtein tolerance
- **Four modes:** Timed, Endless, Sudden Death, Progressive Reveal, SM-2 Review
- **SM-2 spaced repetition** — missed questions return on a scientifically-tuned schedule
- Real countdown timer with red-zone warning
- Override buttons for when the auto-check is wrong
- Session summary with Wordle-style emoji history (🟩🟥🟩🟥🟩)
- Keyboard-first: Enter / Space / Esc / Arrow keys

### Site
- **Two themes:** Brutalist (default — paper + black + orange) and Carbon (dark + neon green, "professional view")
- Search with fuzzy matching, topic + difficulty filters, deep-linkable question URLs
- **Cloud sync** via Supabase — anonymous sign-in, auto-sync every 60s
- Knowledge Wiki (save questions to study later)
- Analytics page with topic mastery, accuracy trends, daily activity heatmap
- Daily challenge — same 5 questions for everyone, shareable emoji results

### Automation pipeline
- Drop a PDF/PPTX into `quiz-automator/input/`
- Watcher detects the file, runs text extraction, falls back to EasyOCR for image-based slides
- State-machine parser builds Q/A/funda blocks
- Strict validation: rejects malformed questions, dedupes via trigram Jaccard similarity
- Wikipedia + Pexels image enrichment
- GitHub Models (GPT-4o-mini) generates fundas for empty entries
- Auto-archives to `processed/` after success
- Self-healing watcher restarts on crash

---

## Stack

- **Frontend:** Vanilla HTML / CSS / JS, no framework
- **JS modules:** 30 standalone files, custom web components (`<quiz-card>`)
- **Animation:** GSAP + ScrollTrigger (motion respects `prefers-reduced-motion`)
- **Data:** Single `data/questions.js` file (versioned, schema-checked)
- **Storage:** localStorage + Supabase REST API
- **Backend automation:** Python 3, PyMuPDF, python-pptx, EasyOCR
- **AI:** GitHub Models (GPT-4o-mini, free tier), Wikipedia REST, Pexels API
- **Hosting:** Netlify
- **Auth:** Supabase Anonymous Sign-in (publishable key)

## Architecture highlights

- **Schema-versioned state** with corruption recovery from auto-backups
- **XSS-sanitized HTML rendering** for all user-data fields
- **Surgical regex-only edits** to `questions.js` — never round-trip through strict JSON parsing (one truncated escape sequence can corrupt 200 questions otherwise)
- **Per-edit Node.js validation** during AI enrichment — auto-rollback if any change breaks JS parse
- **Smoke test** before every deploy: parses questions.js, checks all image refs resolve, checks JS syntax across all 30 files, validates HTML script tags, scans for accidentally committed API keys
- **Health-scored content** — every question scored 0-100 across length, OCR-noise, alpha ratio, image existence, topic match

## Local development

```bash
git clone https://github.com/YOUR_GITHUB/quizvault.git
cd quizvault

# Run the site locally
python -m http.server 8000
# Open http://localhost:8000

# Run the automation pipeline
cd quiz-automator
pip install -r requirements.txt
python scripts/watcher.py

# Build a deploy zip (allow-list — only ships referenced assets)
python scripts/deploy.py
```

## Project structure

```
QUIZBANK/
├── index.html               # Home page
├── questionbank.html        # Browse all questions
├── wiki.html                # Saved-knowledge page
├── analytics.html           # Stats dashboard
├── 404.html
├── _redirects               # Netlify SPA routing
├── css/
│   └── styles.css           # Brutalist + Carbon themes
├── js/
│   ├── state.js / store.js  # Central state
│   ├── home.js / qb.js      # Page logic
│   ├── practice.js          # Practice mode engine
│   ├── sm2.js               # Spaced-repetition algorithm
│   ├── cloud-sync.js        # Supabase sync
│   ├── animations.js        # GSAP timelines
│   ├── theme.js             # Brutalist ↔ Carbon
│   ├── sanitizer.js         # XSS-safe rendering
│   ├── components/
│   │   └── quiz-card.js     # <quiz-card> web component
│   └── ...
├── data/
│   └── questions.js         # Single source of truth
├── images/                  # Question + answer images
└── quiz-automator/          # Python pipeline (not deployed)
    ├── scripts/
    │   ├── watcher.py
    │   ├── extractor.py
    │   ├── ocr_extractor.py
    │   ├── enrich_fundas_github.py
    │   ├── enrich_all.py
    │   ├── smoke_test.py
    │   ├── health_check.py
    │   └── deploy.py
    ├── input/               # Drop quiz files here
    └── processed/           # Auto-archived after extraction
```

## What I learned building this

- **OCR is fragile.** EasyOCR produced clean text on roughly 60% of slides, garbage on the rest. Building a quality-scoring `health_check.py` ended up being more useful than the extractor itself — it made the bad questions visible so they could be fixed targeted.
- **AI for content cleanup is the unlock.** Once GitHub Models came in (free tier, no card), 83 missing fundas were generated in 7 minutes with zero errors and per-edit JS validation.
- **Defensive coding > clever coding.** The site went to zero questions five times during development because a refactor stripped a `<script src="data/questions.js">` tag. Pinning script tags with HTML comments and writing a "non-regression contract" doc for AI collaborators stopped the bleeding.
- **Two AIs can collaborate** if you give each one a hard-rules document, restrict ownership of specific files, and gate every change behind a smoke test.

## License

MIT
