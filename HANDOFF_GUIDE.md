# 📦 QuizVault — Complete Handoff Guide

For: the next maintainer of this codebase
From: the current builders (one human + two AI assistants)
Last updated: 2026-05-22

---

## 1. What QuizVault is

QuizVault is a **personal GK quiz study tool** built as a static website with a Python automation pipeline behind it. The owner drops a PDF or PPTX quiz file into a folder, and within minutes the pipeline extracts questions, OCRs slides, generates AI fundas, fetches images, and the questions appear on a live brutalist-themed site with practice mode, spaced repetition, cloud sync, and analytics.

It is hosted on Netlify. Right now there are **~200 questions, ~10 topics**. The owner uses it daily.

**The site itself is plain HTML/CSS/JS — no framework.** The automation is plain Python — no Django/Flask.

Everything is deployable from one command (`python quiz-automator/scripts/deploy.py`).

---

## 2. Quick start for someone new

```bash
# Clone / open
cd D:/QUIZBANK

# Run the site locally
python -m http.server 8000      # then open http://localhost:8000

# Run the automation pipeline (watches for new quiz files)
cd quiz-automator
pip install -r requirements.txt
python scripts/watcher.py        # or double-click watcher_service.bat

# Run a smoke test (always before deploy)
python scripts/smoke_test.py

# Build a deploy zip
python scripts/deploy.py
# (this opens Netlify Drop in your browser — drag the zip onto it)
```

API keys live in `quiz-automator/config.json`. The required-ish ones:
- `pexels_api_key` — for stock images (free signup)
- `github_models_token` — for AI fundas via GPT-4o-mini (free with any GitHub PAT)
- `openrouter_api_key`, `gemini_api_key` — alternative AI providers (optional)
- Supabase URL+anon key — hardcoded in `js/cloud-sync.js` (free tier)

---

## 3. Architecture overview

```
                    ┌─────────────────────────────────┐
                    │   USER drops PDF/PPTX into      │
                    │   quiz-automator/input/         │
                    └──────────────┬──────────────────┘
                                   ▼
            ┌──────────────────────────────────────────┐
            │  watcher.py   (polls every 30s)          │
            │  ↓                                        │
            │  extractor.py  → text-based extraction   │
            │  ↓ (fallback if no text)                 │
            │  ocr_extractor.py (EasyOCR on slides)    │
            │  ↓                                        │
            │  questions_updater.py                    │
            │  · validate · dedup · trigram-match      │
            │  · copy images to site/images/           │
            │  · append to data/questions.js           │
            │  ↓                                        │
            │  archive PPTX to processed/              │
            └──────────────────────────────────────────┘
                                   ▼
            ┌──────────────────────────────────────────┐
            │  data/questions.js  (200 questions)      │
            │  · JS file with const QUIZ_QUESTIONS=[]  │
            │  · single source of truth                │
            └──────────────────────────────────────────┘
                                   ▼
            ┌──────────────────────────────────────────┐
            │  Frontend (4 HTML pages)                 │
            │  · index.html        — home / hero       │
            │  · questionbank.html — browse 200 Qs     │
            │  · wiki.html         — saved Qs          │
            │  · analytics.html    — real stats        │
            │                                          │
            │  21 JS modules (vanilla, no framework)   │
            │  · state.js / store.js  central store    │
            │  · practice.js          practice engine  │
            │  · sm2.js               spaced repetition│
            │  · cloud-sync.js        Supabase sync    │
            │  · ...etc                                │
            └──────────────────────────────────────────┘
                                   ▼
            ┌──────────────────────────────────────────┐
            │  Netlify  (drag-drop zip from deploy.py) │
            │  · PWA: installable, works offline       │
            │  · _redirects routes 404s to 404.html    │
            └──────────────────────────────────────────┘
```

---

## 4. Every file — what it is and does

### 4.1 Root-level deployable files

| File | Purpose |
|---|---|
| `index.html` | Home page. Hero (BUILT FOR THE OBSESSED), stats bar (Q_COUNT / ACCURACY / STREAK / DRILLS_TODAY), START_PRACTICE button. Loads home.js. |
| `questionbank.html` | Browse all 200 questions. Has sidebar with search + topic + difficulty filters. Grid of `<quiz-card>` web components. |
| `wiki.html` | "Saved Knowledge" dossier. Shows questions the user starred via SAVE_TO_WIKI. |
| `analytics.html` | Stats dashboard. Topic mastery bar chart, accuracy trend, daily activity heatmap. Reads from real localStorage data. |
| `404.html` | Custom not-found page in the brutalist style. |
| `_redirects` | Netlify routing config — sends all unknown URLs to 404.html. |
| `robots.txt` | SEO — allows crawlers, points at sitemap. |
| `sitemap.xml` | SEO — lists the 4 main pages. |
| `manifest.json` | PWA manifest — name, icons, theme color, makes the site installable as an app. |
| `sw.js` | Service Worker — caches all assets for offline use. |
| `README.md` | Public-facing GitHub README. Describes features, stack, architecture for visitors. |

### 4.2 CSS

| File | Purpose |
|---|---|
| `css/styles.css` | Single CSS file (~1100 lines). Brutalist theme (paper #f3f0e8, ink #0a0a0a, hot orange). Includes Carbon dark-theme override at the bottom (currently no toggle UI). Mobile responsive media queries at the very end. |

### 4.3 Frontend JS — `js/` (21 files)

| File | What it does |
|---|---|
| **`state.js`** | Legacy state API. Wraps `store.js`. Other files call `state.subscribe(cb)`, `state.data.questions`, `state.toggleFavorite(id)`, etc. |
| **`store.js`** | Redux-style central state engine. Holds questions, performance stats, favorites, wiki saves. Dispatches actions. |
| **`api.js`** | Export/import progress as JSON file. `QVApi.downloadBackup()`, `QVApi.uploadBackup(file)`. Wired to buttons on analytics.html. |
| **`sanitizer.js`** | XSS-safe HTML renderer. Allows only `<strong>`, `<em>`, `<br>`, `<mark>`. Strips everything else. Used by quiz-card.js. |
| **`error-boundary.js`** | Catches uncaught JS errors. Shows a brutalist "SYSTEM_FAULT / LOAD_ERROR" overlay if questions.js fails to load. |
| **`home.js`** | index.html logic. Populates stats bar (Q_COUNT, ACCURACY, STREAK, DRILLS_TODAY) from localStorage. Wires START_PRACTICE button. |
| **`qb.js`** | questionbank.html logic. Renders quiz-cards, handles search + topic + difficulty filters, URL state (?topic=sports). |
| **`practice.js`** | THE practice engine. ~700 lines. Dynamically injects modal+overlay+summary HTML. Handles Timed/Endless/Sudden Death/Progressive/SM2 modes, timer, smart answer matching, near-miss detection, combo streaks, session draft autosave, summary screen. |
| **`sm2.js`** | SM-2 spaced repetition algorithm (Anki-style). `QV.sm2.review(qid, quality)`, `QV.sm2.getDueQuestions()`. Stores in `localStorage.qv_sm2`. |
| **`cloud-sync.js`** | Supabase cloud sync. Hardcoded URL+anon key. Self-injects ☁ SYNC button into navbar. Anonymous sign-in → push/pull every 60s. Sync keys: qv_performance, qv_favorites, qv_wiki, qv_sm2, qv_daily_results. |
| **`analytics.js`** | analytics.html logic. Reads real qv_session_history + qv_performance from localStorage → renders pixel-bar charts. |
| **`onboarding.js`** | First-time user tour. 4-step overlay shown only if `localStorage.qv_visited !== '1'`. |
| **`animations.js`** | All GSAP animations. Trimmed-down version — only purposeful animations remain. Hero fade-in, card stagger reveal, modal entry. |
| **`youtube-embed.js`** | Detects YouTube URLs in question text and renders an iframe instead of showing the raw URL. |
| **`command-palette.js`** | Press `/` anywhere → command palette overlay opens. Navigate to pages, jump to questions, start practice. |
| **`search-worker.js`** | Web Worker that filters questions off the main thread. Loaded by qb.js for snappy search even with large question sets. |
| **`components/quiz-card.js`** | The `<quiz-card>` custom HTML element. Renders one question card with REVEAL ANSWER, FAV, SAVE_TO_WIKI, SHARE buttons. Includes the YouTube embed integration and image rendering. |

### 4.4 Dead JS files (kept for legacy reasons; check before deleting)

| File | Status |
|---|---|
| `js/i18n.js` | Stub for future translations. Not loaded by any HTML. Safe to delete. |
| `js/cache.js`, `js/secure-storage.js` | Stubs from older Antigravity refactor. Not currently loaded. Safe to delete. |
| `js/core/container.js` | Single-file legacy. Not loaded. Safe to delete. |

### 4.5 Data

| File | Purpose |
|---|---|
| `data/questions.js` | **The single source of truth.** A JS file declaring `const QUIZ_QUESTIONS = [ {id, topic, difficulty, type, question:{text,image}, answer:{text,image}, funda:{text,image}}, ... ];`. ~200 questions, ~95 KB. |
| `data/questions.js.*.bak` | Auto-backups from various enrichment scripts. Don't deploy. Useful for rollback. |

### 4.6 Images

| Path | Purpose |
|---|---|
| `images/*.jpg / *.png` | Question + answer images. Named `q{ID}_question.jpg`, `q{ID}_answer.jpg`, `q{ID}_wiki.jpg`. Pexels and OCR-orphan images have been purged. |
| `images/favicon.png`, `favicon-192.png`, `favicon-512.png` | PWA icons. |
| `images/og_card.png` | OpenGraph share preview card (1200×630). |
| `images_originals_backup/` | High-res originals from before optimization. **Not deployed.** Useful for re-extracting. |

### 4.7 Automation — `quiz-automator/scripts/`

**Core pipeline:**

| Script | Purpose |
|---|---|
| **`watcher.py`** | Polls `input/` every 30s for new files. For each new file: runs extractor → updater → archives to processed/. Logs to `automation.log`. |
| **`extractor.py`** | The main extractor. Tries text-based parsing first (PyMuPDF for PDF, python-pptx for PPTX, zipfile for ODF). If no text found, falls back to `ocr_extractor.py`. |
| **`ocr_extractor.py`** | EasyOCR-based slide reader. Renders each slide as PNG, OCRs the top strip to detect "ANSWER" banners, then OCRs question + answer regions. State machine builds Q/A pairs. Has special handling for "SOMEONE FAMOUS" visual-ID slides. |
| **`questions_updater.py`** | Validates and appends new questions to `data/questions.js`. Includes: trigram-based dedup (rejects near-duplicates), strict validation (topic must be in allowed list, answer text must exist), image copying with collision-safe filenames. Updates `id` to be monotonic. |
| **`smoke_test.py`** | Run before deploy. Checks: questions.js parses + has IDs, all referenced images exist on disk, all 21 JS files have valid syntax, all 4 HTML pages reference required scripts, no API keys leaked into deploy folder. |
| **`deploy.py`** | One-command deployer. Runs smoke_test → builds zip with ALLOW-LIST of files (skips backups, OCR caches, dev junk) → opens Explorer + Netlify Drop. Minifies CSS/JS on the way in. Final zip ~12 MB. |

**Enrichment scripts (one-shot tools to improve content quality):**

| Script | Purpose |
|---|---|
| `enrich_all.py` | Wraps multiple enrichment passes (Wikipedia fundas, OCR cleanup, difficulty, images) in one call. |
| `enrich_fundas.py` | Fetches Wikipedia summaries for questions with empty fundas. |
| `enrich_fundas_github.py` | **Best version.** Uses GitHub Models (GPT-4o-mini, free tier) to generate 1-2 sentence fundas. Per-edit JS validation. |
| `enrich_fundas_ai.py` | Uses OpenRouter API to generate fundas. Hit rate-limit issues, replaced by GitHub variant. |
| `enrich_fundas_pollinations.py` | Uses free Pollinations.ai service. Worked but lower quality. |
| `enrich_ocr_cleanup.py` | Strips OCR garbage tokens (e.g., `oxymRIC`, `Hedetnhsokeht`) via regex + pyspellchecker. |
| `enrich_difficulty.py` | Auto-assigns easy/medium/hard via length + obscurity heuristic. |
| `enrich_images.py` | Fetches Pexels images for questions with no image. **Mostly disabled** — Pexels images were too irrelevant (purged). |
| `gemini_extractor.py` | Alternative Gemini-based extractor. Not used (Gemini API quota issues). |

**Cleanup / fix scripts (point-fix tools):**

| Script | Purpose |
|---|---|
| `cleanup_questions.py` | Surgical cleanup of OCR artifacts in existing questions. |
| `fix_data_bugs.py` | Strips `[ATTACH IMAGE]` markers, re-classifies topics, detects multi-clue progressive-reveal questions. |
| `fix_bad_images.py` | Removes incorrect Pexels images on person-name answers; tries Wikipedia replacement. |
| `fix_visual_prefixes.py` | Removes the `[VISUAL QUESTION — image not available]` polluting prefix from question texts (created from a buggy earlier script). |
| `purge_pexels.py` | Deletes all Pexels-sourced random stock images and nulls their refs in questions.js. |
| `assign_visual_images.py` | OCRs every slide in processed PPTXes and tries to match them to questions with missing images. Low success rate. |
| `extract_pptx_images.py` | Pulls embedded images out of PPTX files for manual review. |
| `optimize_images.py` | Compresses PNGs to JPEGs at quality 80, resizes anything over 1200px. Saved 165 MB. Backs up originals. |

**Analytical tools:**

| Script | Purpose |
|---|---|
| `health_check.py` | Scores every question 0-100 across length, OCR-noise, image existence, topic match. Identifies questions needing manual review. |
| `slideshare_scraper.py` | Downloads slides from a Slideshare URL, runs them through ocr_extractor. (Optional integration.) |
| `image_fetcher.py` | Pexels API wrapper. Used by enrich_images.py. |
| `html_builder.py` | Older "preview HTML card" generator. Not in main flow. |
| `build_og_card.py` | Generates the og_card.png OpenGraph preview image. |

### 4.8 Configuration

| File | Purpose |
|---|---|
| `quiz-automator/config.json` | Master config. Holds: site_folder path, all API keys (Pexels, GitHub Models, Gemini, OpenRouter), poll interval, topic keyword dictionary. |
| `quiz-automator/requirements.txt` | Python dependencies. Run `pip install -r requirements.txt`. Includes: easyocr, pillow, python-pptx, pymupdf, pyspellchecker, csscompressor, jsmin, requests. |
| `quiz-automator/watcher_service.bat` | Windows batch file — double-click to start the watcher in a self-restarting loop. Add to Windows Startup folder for boot-time launch. |
| `quiz-automator/CLAUDE.md` | AI assistant instructions (used during dev). |

### 4.9 Folders

| Folder | Purpose |
|---|---|
| `quiz-automator/input/` | Drop new PDF/PPTX files here. Watcher detects them. |
| `quiz-automator/processed/` | Successfully-processed quiz files get moved here with timestamp prefix. **Don't delete** — needed if you want to re-extract images. |
| `quiz-automator/logs/` | automation.log with ISO timestamps of every step. |
| `quiz-automator/deploys/` | Generated zip files. Each named `quizvault_<timestamp>.zip`. |
| `images_originals_backup/` | Backed-up uncompressed versions of images. Not deployed. |

### 4.10 Docs

| File | Purpose |
|---|---|
| `README.md` | Public GitHub readme. Polished for visitors. |
| `ROADMAP.md` | The 5-phase build roadmap. Most phases now complete. |
| `IMPROVEMENTS_REPORT.md` | Detailed report on the last polish pass — Lighthouse, PWA, etc. |
| `AUDIT_REPORT.md` | One-time cleanup audit results. |
| `PROMPTS_README.md` | Index of the 6 Antigravity prompt files. |
| `CLAUDE_HANDOFF.md` | Coordination doc between the two AI assistants. |
| `PHASE1-5_PROMPT.md` | Self-contained prompts for each phase. Paste-ready for Antigravity. |
| `BRUTALIST_PROMPT.md` | Visual overhaul prompt. |
| `quiz_automation_directive.md` | Original project brief. |
| `claude.md` | AI assistant project rules. |

### 4.11 Junk that can be deleted

The owner experimented a lot. These files in the project root are dev artifacts:

| File | Why it exists | Safe to delete? |
|---|---|---|
| `check_fitz.py`, `extract_docx.py`, `extract_full.py`, `extract_v2.py`, `extractor.py` (root) | Old extraction experiments. Live versions are in `quiz-automator/scripts/`. | Yes |
| `html_builder.py`, `image_fetcher.py`, `site_updater.py`, `watcher.py` (root) | Old copies. Live versions in `quiz-automator/scripts/`. | Yes |
| `blocks_debug.txt`, `extracted_questions.json`, `extracted_text_v2.json` | Debug outputs from extraction runs. | Yes |
| `quiz-automator/=0.10.0`, `=1.23.0`, `=3.0.0` | Mistakenly-created files from a `pip install >=0.10.0` typo. | Yes |
| `quiz-automator/gsap_repo.json`, `gsap_skills_dir.json` | Cached responses from GitHub API during dev. | Yes |
| `quiz-automator/preview.html` | Old preview template. | Yes |

---

## 5. Every problem that exists right now (open bugs)

### 5.1 Content quality

| Problem | Severity | Notes |
|---|---|---|
| **3 questions still have empty/garbled answers** | Low | IDs flagged by `health_check.py` as score <60. Structural issues — best fixed manually. |
| **~9 visual questions are missing images** | Medium | Questions like "Pictured below is X" where original PPTX had an image we couldn't recover. The site shows them text-only. |
| **Q124 ("Connect the two visuals" / Morse code) needs 2 images** | Medium | The data model is `image: string`, no array support. Antigravity attempted an OCR-match but matched the wrong slide. Now reverted to no image. Real fix: extend schema to `images: []` AND manually assign for this question. |
| **Some answers have minor OCR artifacts** | Low | e.g., "Ihe DUKE ad DUCHESS o SUSSEX" — would need manual cleanup or another AI pass. |
| **Topic auto-classification is heuristic-based** | Low | Some "sports" questions are tagged "general" because keyword dictionary missed them. Re-run `fix_data_bugs.py` after expanding the keyword list. |

### 5.2 Architectural quirks

| Quirk | Why it's here | Should it be fixed? |
|---|---|---|
| `state.js` is a wrapper around `store.js` | Legacy from a Redux-ish refactor. `state.subscribe()` etc. still work via the wrapper. | Leave as-is. Rewriting risks breaking many call sites. |
| Practice modal HTML is INJECTED by `practice.js`, not in HTML | Single source of truth — avoids duplicate-DOM bugs we had earlier. | Leave as-is. |
| Cloud-sync credentials are hardcoded in `cloud-sync.js` | Publishable Supabase key is designed for client use. Safe to commit. | Leave as-is for now. If you migrate to email-link auth (Phase 5 idea), revisit. |
| `data/questions.js` is a JS file (not JSON) | Lets us avoid CORS issues on `file://` and avoids a fetch + parse cycle. | Leave as-is. |
| Sometimes IDs jump (e.g., Q3 → Q5 missing Q4) | Some questions were deleted during cleanup. IDs are not contiguous. | Don't renumber — would break shared URLs (`#q-42`). |

### 5.3 Things that look broken but aren't

| Concern | Actually |
|---|---|
| "There's no `?admin=1` editor" | Never built. Editing happens by hand-editing `questions.js` or via a future feature. |
| "Carbon theme has no toggle" | The CSS exists (`[data-theme='carbon']`) but the toggle UI was removed (owner preferred single theme). To re-enable, restore `js/theme.js` and add a `<button id="theme-toggle">` to navbar. |
| "Daily quiz card is gone" | Owner explicitly removed it from index.html. Code is still in `js/daily.js` for revival if needed. |
| "Site shows 'q124_pexels.jpg not found'" | If the user has stale browser cache. Hard-refresh (Ctrl+Shift+R). |
| "Some buttons (theme/audio) missing from navbar" | Owner removed them — preferred minimal UI. CSS classes remain for future use. |

### 5.4 Watch-outs for the new maintainer

1. **`data/questions.js` is fragile.** Never `JSON.loads()` it through Python's strict parser — some answer texts have escape sequences that pass JS eval but fail strict JSON. Always use **surgical regex edits** on the raw text. Pattern in every enrichment script: read text → modify with regex → write back → `node -e "new Function(text)"` to verify → rollback if invalid.

2. **Pexels images are mostly removed.** If you re-run `enrich_images.py`, it'll re-add irrelevant stock photos. Either filter to specific topics only, or skip Pexels and use Wikipedia thumbnails only.

3. **Antigravity (the other AI) has a track record of stripping `<script>` tags during refactors.** Every `<script src="data/questions.js">` has a `<!-- DO NOT REMOVE -->` HTML comment above it. Don't remove those.

4. **Practice mode HTML is INJECTED by JS at runtime.** Don't add a static `<div id="practice-modal">` to HTML pages — the duplicate IDs will break event listeners.

5. **Two AIs collaborated.** Some code uses `var`/`let`/`const` inconsistently. Some Pythons scripts overlap in purpose. The naming sometimes reflects the AI that wrote it (e.g., `enrich_fundas_ai.py` vs `enrich_fundas_github.py`). Functionally everything works; pick a style going forward.

6. **The Supabase publishable key is in `js/cloud-sync.js`.** This is the *publishable* (anon) key — safe to commit. If you ever see `sb_secret_*` anywhere in the frontend, that's a leak and must be revoked.

7. **`quiz-automator/processed/` has the original PPTX files.** Don't delete. If you ever want to re-extract images for the broken visual questions, that's the only source.

---

## 6. Every feature, organized

### 6.1 Public site features

- **200 questions** with answers, fundas, images, difficulty ratings, topic classification
- **Smart search** (fuzzy + typo-tolerant, debounced 200ms)
- **Topic filter chips** (Sports, History, etc.) with question counts
- **Difficulty filter** (Easy / Medium / Hard / All)
- **Deep-link URLs** (`#q-42` jumps to question 42; `?topic=sports` filters)
- **Practice mode** with 5 modes:
  - Timed (real countdown bar)
  - Endless (no timer)
  - Sudden Death (one wrong = session over)
  - Progressive Reveal (clues unlock one at a time)
  - SM2 Review (only practices questions due via spaced repetition)
- **Smart answer matching** — accepts case-insensitive, punctuation-insensitive, single-word matches, 78% similarity for short answers
- **Near-miss detection** — "ALMOST. CHECK_SPELLING!" instead of wrong for 1-2 char typos
- **Speed Demon bonus** — extra XP for answers <5s
- **Combo streak rewards** — 3x/5x/10x messaging
- **Override buttons** — "I missed it" / "I got it right" if auto-check is wrong
- **Session summary screen** (replaces the old alert() popup) with stats + Wordle-style emoji history
- **Keyboard shortcuts** — Enter (submit), Space (continue), Esc (exit), `/` (command palette), `g h/b/w/s` (navigate)
- **Wiki** — save questions to study later
- **Favorites** — bookmark questions
- **Share button** — copies a deep-link to the question
- **Analytics page** — real topic mastery, accuracy trend, daily activity heatmap (no fake data)
- **Cloud sync** — `☁ SYNC` button does anonymous Supabase sign-in, auto-syncs every 60s
- **PWA support** — installable on phone as an app, works offline (Service Worker caches everything)
- **Site health badge** — green dot in navbar; turns red if questions.js fails to load
- **404 page** — branded brutalist not-found
- **OpenGraph cards** — nice previews when shared on WhatsApp/Twitter
- **Mobile responsive** — collapses sidebar, stacks stats, scales hero text
- **First-time tour** — 4-step overlay for new visitors
- **Onboarding skip** — clearable via localStorage

### 6.2 Backend automation features

- **Drop-and-go pipeline** — drop a PDF/PPTX, walk away, the rest is automatic
- **Multi-format support** — PDF, PPTX, ODF, ODP, ODT, plain text
- **OCR fallback** — image-based slides via EasyOCR (no API key needed)
- **State-machine parser** — handles Q/A/funda blocks, section headers, page numbers
- **Trigram fuzzy dedup** — catches reworded duplicates, not just exact ones
- **Strict validation** — rejects questions with missing fields, invalid topics, too-long/short text, suspicious OCR noise
- **AI funda generation** (GitHub Models / GPT-4o-mini) — fills empty fundas with factual trivia
- **Wikipedia integration** — auto-fetches thumbnails + summaries for proper nouns
- **Pexels integration** (optional, currently disabled by default) — fallback stock images
- **Multi-pass enrichment** — `enrich_all.py` runs OCR cleanup → difficulty → fundas → images in order
- **Image optimization** — PNG → JPEG quality 80, resize >1200px, backed up originals
- **Self-healing watcher** — auto-restarts on crash (watcher_service.bat loops)
- **Smoke test gate** — deploy refuses if any check fails
- **Allow-list deploy zip** — only ships intended files (was a problem when Git installation got zipped at 382 MB)
- **One-command deploy** — `python scripts/deploy.py` builds zip + opens Netlify Drop

---

## 7. How to do common tasks

### "Add a new quiz file"
1. Drop the PDF/PPTX into `quiz-automator/input/`
2. If watcher isn't running: `cd quiz-automator && python scripts/watcher.py` (or double-click `watcher_service.bat`)
3. Wait for it to log "Archived: ..." — file moves to processed/, questions appear in `data/questions.js`
4. Refresh the local site in your browser to see new questions
5. When happy, run `python scripts/deploy.py` and drag the zip onto Netlify Drop

### "Manually edit a question"
1. Open `data/questions.js` in any editor
2. Find the question by ID (`"id": 42,`)
3. Edit the text inside the strings. **Escape any quotes** as `\"`. **Avoid unescaped newlines.**
4. Save the file
5. Verify it still parses: `node --check data/questions.js` (or just open the site — if broken, you'll see "0 QUESTIONS" in the stats bar)
6. Run `python quiz-automator/scripts/smoke_test.py` to be sure

### "Fix a question's image"
1. Drop the correct image file into `images/` named `q{ID}_question.jpg` (or `_answer.jpg`)
2. In `data/questions.js`, find that question and set `"image": "images/q{ID}_question.jpg"` in the appropriate slot
3. Smoke test

### "Re-run AI funda generation"
1. Make sure `config.json` has a valid `github_models_token` (a regular GitHub PAT works)
2. `python quiz-automator/scripts/enrich_fundas_github.py`
3. It only processes questions with empty fundas — won't overwrite existing ones
4. Each edit is per-edit validated; auto-rolls back on JS parse failure

### "Re-categorize a question to the right topic"
1. Edit `topic: "..."` directly in `data/questions.js`
2. Allowed values: sports, wildlife, current-affairs, history, politics, cuisines, general

### "Check site health"
- `python quiz-automator/scripts/health_check.py` — lists every question with quality issues
- `python quiz-automator/scripts/smoke_test.py` — quick yes/no readiness check

### "Deploy"
- `python quiz-automator/scripts/deploy.py`
- Zip lands in `quiz-automator/deploys/`
- Netlify Drop page opens — drag the zip onto it

---

## 8. What's still on the wishlist (not done)

These are nice-to-haves that would push the site further:

- **Real email-link auth** (currently anonymous Supabase only) — needed for friends/leaderboards
- **Public daily-quiz leaderboard** (current site has the daily code in `js/daily.js` but the UI was removed)
- **Multi-image schema** (`q.images = []`) for "Connect" / "two visuals" questions
- **AI question generator** — "generate 10 history questions" using GitHub Models, removes OCR dependency
- **Embedded YouTube clips on answers** (the question-side embed works via `youtube-embed.js`; answers don't currently render embeds)
- **In-browser question editor** (`?admin=1` mode) — would remove the need to hand-edit `questions.js`
- **Lighthouse 100/100** — currently passes 90+ but never optimized further
- **Real test suite** — Playwright tests for practice flow, theme toggle, sync round-trip
- **Internationalization** — `i18n.js` stub exists for future translations

---

## 9. The honest assessment

This codebase is **larger than it strictly needs to be** because it grew organically across multiple AI-assisted sessions. There are leftover dev scripts, duplicate naming patterns, and a few experimental modules that never got cleaned up. But:

- **The site works.**
- **The automation pipeline works.**
- **The deploy pipeline works.**
- **The data is the cleanest it's ever been.**
- **The smoke test gates all changes.**

A good first task for the new maintainer would be:
1. Read this doc end-to-end (you're doing it now)
2. Delete the dev junk in Section 4.11 — frees ~3 MB and clarifies what's load-bearing
3. Run `smoke_test.py` after the delete to confirm nothing breaks
4. Then start working on whatever feature is most needed

If you ever feel lost, the rule that has saved this project multiple times:

> **Never modify `data/questions.js` via JSON parse. Always read raw → regex edit → verify with `node -e`. The file looks like JSON but isn't strict JSON.**

Good luck.

— The previous team
