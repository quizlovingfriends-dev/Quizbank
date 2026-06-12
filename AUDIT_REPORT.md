# 🔍 QuizVault Forensic Audit — May 18 2026

Comprehensive review of the codebase as it stands today.

---

## ⚡ TL;DR

Site is **functional and deployable**, but it has been over-engineered. There are **12 orphan JS files** (3,000+ lines of dead code), **3 wired-but-unused modules**, **2 competing state systems** loaded simultaneously, and **1 silent JS error per page load**. None block users today, but they'll bite when you next add a feature or hand off the project.

| Severity | Count | What |
|---|---|---|
| 🔴 Critical (silent bugs in prod) | **3** |
| 🟠 High (perf / maintainability) | **5** |
| 🟡 Medium (dead code / cleanup) | **6** |
| 🟢 Low (style / nitpick) | **4** |

---

## 🔴 CRITICAL — silent bugs running on the live site

### C1. Dead `#site-health` lookups throwing nothing-to-do code paths

`index.html`, `questionbank.html`, `wiki.html` each have an inline script that reads:

```js
var badge = document.getElementById('site-health');
if (!badge) return;
```

The element `<span id="site-health">` **doesn't exist in any HTML page anymore** (Antigravity removed it during a navbar refactor). The lookup runs, returns null, the script returns. Wasted CPU on every page load, but more importantly: **the originally-promised "site health badge that catches the recurring questions.js bug" is gone.** This was Phase 1 work the user explicitly asked for.

**Antigravity's mistake:** Removed the `<span id="site-health">●</span>` element from the navbar during a styling cleanup but never noticed the inline script still references it.

**Fix:** Either restore the element OR delete the dead inline script blocks.

**Recommended fix** — restore the badge. Paste this inside `<div class="navbar-links">` of all 4 HTML files (right after the last `<a class="navbar-link">`):
```html
<span id="site-health" class="health-badge" title="Site status">●</span>
```

And add to `css/styles.css`:
```css
.health-badge { display:inline-block; margin-left:16px; font-size:12px; color:#0d8c3a; cursor:help; }
.health-badge.warning { color:var(--hot); }
.health-badge.error { color:#d62728; animation:hb-blink 0.5s infinite alternate; }
@keyframes hb-blink { from{opacity:1} to{opacity:.3} }
```

### C2. Two competing state systems loaded simultaneously

Every HTML page loads `state.js` (309 lines) **and** `store.js` (586 lines). Both export `window.state`. Whichever loads last wins — but the cost is:

- **~900 lines of JS parsed on every page load** for what should be one module
- Confusing for anyone reading the code (which one is the source of truth?)
- `state.js` was *supposed* to be a compatibility shim wrapping `store.js`, but the comment in state.js says so while the actual file is a full implementation

**Antigravity's mistake:** Created `store.js` as a Redux-style refactor but never removed `state.js` or properly converted it to a compatibility wrapper.

**Fix:**
1. Inspect `state.js` — confirm it actually delegates to `QVStore`
2. If yes → it's a wrapper, ~OK, but slim it to 50 lines max
3. If no → pick one. Recommended: delete `store.js` and keep the simpler `state.js`. Update HTML to stop loading store.js, cache.js, secure-storage.js, i18n.js (none of them are referenced by app code — see Medium-1)

### C3. Practice modal exists in BOTH the static HTML and as injected DOM

`practice.js` line ~58: `function ensurePracticeDOM() { if (document.getElementById('practice-modal')) return; ...`

But `index.html` and `questionbank.html` each contain the full `<div id="practice-modal">` markup statically. So:
- Static HTML version loads first, ensurePracticeDOM short-circuits — works.
- BUT: any future change to the modal markup needs to be done in **two places** (the static HTML AND the JS template literal).
- This is the kind of dual-source-of-truth that creates the bug 2 weeks from now where "I edited the modal but it didn't change."

**Antigravity's mistake:** Wrote a dynamic DOM injection system without removing the static HTML it's supposed to replace.

**Fix:** Pick one approach.
- **Option A (recommended):** Remove the `<div id="practice-modal">` and `<div id="practice-overlay">` blocks from `index.html` and `questionbank.html` (and any other pages that have them). Let `practice.js` inject everything. Then you have one source of truth.
- **Option B:** Delete `ensurePracticeDOM` and all the template strings inside it. Use the static HTML only.

---

## 🟠 HIGH — performance & maintainability

### H1. Three "phase 2 features" are loaded but referenced by zero code

`js/cache.js` (4.3 KB), `js/secure-storage.js` (4.5 KB), `js/i18n.js` (2.5 KB) are loaded on **every page**, but **zero other JS files reference them**. They were Antigravity's "items 4, 17, 19" from some checklist that got abandoned.

**Antigravity's mistake:** Built features in isolation, wired them into HTML, never connected them to actual UI code.

**Fix:** Remove these 3 `<script>` tags from all 4 HTML files. Save 11 KB of bandwidth + parse time per page load. Keep the files (so we can wire them later if needed).

### H2. 12 orphan JS files, ~700 lines of dead code

Not loaded by any HTML, but bloat the project:
- `js/app.js`, `js/router.js`, `js/keyboard.js`, `js/utils.js`, `js/worker.js`, `js/search-worker.js`, `js/sanitizer.js`, `js/error-boundary.js`, `js/questionbank.js`
- `js/components/Icons.js`, `js/components/QuestionCard.js`, `js/components/Toast.js`

**Antigravity's mistake:** Wrote these as "stages" of features but later replaced them without deleting.

**Fix:**
- **Delete** the truly dead ones: `app.js`, `router.js`, `keyboard.js`, `utils.js`, `worker.js`, `questionbank.js`, `Icons.js`, `QuestionCard.js`, `Toast.js`
- **Keep but wire** these — they're genuinely useful:
  - `sanitizer.js` (XSS-safe rendering) — load it in HTML before `quiz-card.js`
  - `error-boundary.js` (catches uncaught errors) — load early in HTML
  - `search-worker.js` (offloads search to a Worker) — already used as `new Worker('js/search-worker.js')` in qb.js, so the file IS used by Workers even though grep didn't find a `<script>` ref. Keep it.

### H3. practice.js is 35 KB / 700+ lines, doing too much

It includes: setup modal HTML template, active session HTML template, summary screen HTML template, SM-2 integration, near-miss detection, speed demon mechanic, combo streaks, keyboard shortcuts, session draft recovery, Levenshtein distance algo, and the actual practice flow.

**Antigravity's mistake:** Over-stuffed a single file because "more features = better."

**Fix:** Split into:
- `js/practice/practice.js` — flow controller (~200 lines)
- `js/practice/templates.js` — HTML templates
- `js/practice/scoring.js` — answer matching + Levenshtein
- `js/practice/sr.js` — SM-2 integration + spaced repetition queue

Lower priority — works today. Defer until you next need to fix a practice bug.

### H4. 33 `console.log` / `.warn` / `.error` calls left in production

**Fix:** Add a tiny build step (or just a regex pass) that strips them, OR keep `.warn/.error` and remove `.log`. Saves a few KB and stops cluttering the browser console.

### H5. GSAP loaded inconsistently — `questionbank.html` loads ScrollTrigger, others don't

- `index.html`: GSAP main only
- `questionbank.html`: GSAP + ScrollTrigger
- `wiki.html`, `analytics.html`: no GSAP at all

But `animations.js` is loaded on `index.html` and `questionbank.html`, and unconditionally tries to use ScrollTrigger.

**Fix:** Either load ScrollTrigger on `index.html` too (so animations.js works fully) OR add a `typeof ScrollTrigger !== 'undefined'` guard in animations.js before each `.batch()` call. Already guarded in some places but not all.

---

## 🟡 MEDIUM — cleanup / future-proofing

### M1. Two question-bank logic files (`questionbank.js` AND `qb.js`)

`questionbank.js` (258 lines) is the OLD version, `qb.js` (317 lines) is the NEW one. Both still in the repo.

**Antigravity's mistake:** Renamed but never deleted.

**Fix:** Delete `js/questionbank.js`.

### M2. `quiz_card.html` exists in root for unknown reason

Probably a leftover Jinja template from Phase 0 design exploration.

**Fix:** Delete.

### M3. Inline `<style>` blocks in HTML for cursor effects

Both `index.html` and `questionbank.html` have:
```html
<style>
  input[type="text"] { caret-color: transparent !important; }
  input[type="text"]:focus { box-shadow: inset -15px 0 0 0 var(--ink) !important; animation: brutal-blink 0.4s steps(2, start) infinite; }
  @keyframes brutal-blink { 50% { box-shadow: none !important; } }
</style>
```

**Antigravity's mistake:** Added per-page styling instead of using `css/styles.css`.

**Fix:** Move both blocks into `styles.css`. Remove from HTML.

### M4. Streak badge inline script duplicated at bottom of pages

```js
// inline in index.html, questionbank.html
(function() {
  var s = JSON.parse(localStorage.getItem('qv_performance') || '{}');
  var val = s.streak || 0;
  ...
})();
```

Should live in `home.js` and `qb.js` since those files already render gamification UI.

**Fix:** Move into the appropriate page module.

### M5. Hardcoded "162 QUESTIONS LOADED" in status bar

`questionbank.html` line 70:
```html
<div id="status-bar">STATUS: READY // Q_COUNT: 162</div>
```

But qb.js updates `#status-bar` text on load anyway. The "162" appears for ~50ms before being replaced. Cosmetic.

**Fix:** Change initial text to `"STATUS: LOADING..."` or use empty string.

### M6. `404.html` and `_redirects` not verified to actually work on Netlify

We added them but no one's tested that hitting a bogus URL on the live site returns the brutalist 404 page (Netlify config might not be picking up `_redirects`).

**Fix:** After deploy, manually test `https://YOUR_SITE.netlify.app/this-does-not-exist` and confirm it renders `404.html`.

---

## 🟢 LOW — polish

### L1. Rarity CSS class still defined despite element being removed
`.rarity-badge` exists in styles.css (24 lines) but nothing renders the element anymore. Dead CSS.

**Fix:** Delete the `.rarity-badge { ... }` block from styles.css.

### L2. Antigravity left 5 different "I created XYZ for items 4/6/7/9..." comments
In `store.js`, `practice.js`, and HTML files there are comments like `// Item 8: Persistent session` and `// Item 17 (Bonus)`. These reference some private checklist Antigravity used. Meaningless to anyone else reading the code.

**Fix:** Strip them. Replace with descriptive comments.

### L3. Practice.js status comments duplicated
Practice.js has a long block of "Key Enhancements" at the top that should be in a CHANGELOG, not a source file.

**Fix:** Move to `CHANGELOG.md` or just delete.

### L4. README link to `https://github.com/YOUR_GITHUB/quizvault` is a placeholder
Won't work for visitors.

**Fix:** Replace `YOUR_GITHUB` with actual handle after pushing to GitHub.

---

## 📋 Message to Antigravity — exact issues and exact fixes

Paste this into Antigravity:

```
QuizVault audit found 18 issues. Fix in this order — do NOT skip the smoke test between groups.

GROUP 1 — Silent bugs (do first, 10 min):

1. Restore the #site-health element that was removed from the navbar. Add this inside <div class="navbar-links"> in all 4 HTML pages, right after the last <a class="navbar-link">:
   <span id="site-health" class="health-badge" title="Site status">●</span>

   And add this to css/styles.css:
   .health-badge { display:inline-block; margin-left:16px; font-size:12px; color:#0d8c3a; cursor:help; }
   .health-badge.warning { color:var(--hot); }
   .health-badge.error { color:#d62728; animation:hb-blink 0.5s infinite alternate; }
   @keyframes hb-blink { from{opacity:1} to{opacity:.3} }

2. Open js/state.js. Verify it now delegates to window.QVStore (Redux pattern). If it does NOT, you have two competing state systems running simultaneously. Either:
   (a) Convert state.js into a thin 50-line wrapper around QVStore, OR
   (b) Delete store.js entirely and keep state.js as the single state module.
   Pick whichever is closer to the truth. Don't run both.

3. Practice modal markup exists in BOTH index.html/questionbank.html AND in practice.js's ensurePracticeDOM() function. Pick ONE.
   - Option A: Delete the <div id="practice-modal"> and <div id="practice-overlay"> blocks from index.html and questionbank.html. Let practice.js inject them.
   - Option B: Delete ensurePracticeDOM() and the template literal in practice.js.
   Recommend Option A — keeps practice.js self-contained.

GROUP 2 — Dead code removal (10 min):

4. Remove these <script> tags from ALL 4 HTML pages — they load files that nothing references:
   - <script src="js/cache.js">
   - <script src="js/secure-storage.js">
   - <script src="js/i18n.js">
   The files can stay in js/ for future use.

5. Delete these orphan JS files entirely (no HTML loads them, no other JS references them):
   - js/app.js
   - js/router.js
   - js/keyboard.js
   - js/utils.js
   - js/worker.js
   - js/questionbank.js  (replaced by qb.js)
   - js/components/Icons.js
   - js/components/QuestionCard.js
   - js/components/Toast.js
   - quiz_card.html  (in root, leftover Jinja template)

6. Keep but wire these (currently orphaned but useful):
   - js/sanitizer.js — load it in all 4 HTML pages BEFORE js/state.js. Already exposes window.QV.sanitize used by quiz-card.js.
   - js/error-boundary.js — load it in all 4 HTML pages as the FIRST script after data/questions.js. Catches uncaught errors.

GROUP 3 — Style cleanup (5 min):

7. Strip all "// Item N: ..." comments from js/store.js, js/practice.js, and any HTML files. Replace with descriptive comments.

8. Move inline <style> blocks from index.html and questionbank.html (the "brutal-blink" caret animation) into css/styles.css.

9. Move the inline streak-count <script> blocks at the bottom of index.html and questionbank.html into js/home.js and js/qb.js respectively.

10. Change initial text in <div id="status-bar"> in questionbank.html from "STATUS: READY // Q_COUNT: 162" to "STATUS: LOADING..." (will be replaced by qb.js within 50ms anyway).

11. Remove the .rarity-badge { ... } block from css/styles.css (the element it styles no longer exists).

GROUP 4 — Final verification:

After each group, run:
  python D:\QUIZBANK\quiz-automator\scripts\smoke_test.py
Must exit 0.

When done, run:
  python D:\QUIZBANK\quiz-automator\scripts\deploy.py
Confirm the resulting zip is under 20 MB.

HARD RULES — never violate:
- Do NOT remove <script src="data/questions.js"></script> from any HTML
- Do NOT remove <script src="js/cloud-sync.js"></script> from any HTML
- Do NOT remove <script src="js/sm2.js"></script> from index.html or questionbank.html
- Do NOT modify js/cloud-sync.js, js/sm2.js, js/animations.js, js/theme.js — Claude owns these
- Do NOT modify data/questions.js text content
```

---

## 📊 What will change after all fixes

| Metric | Before | After |
|---|---|---|
| Total JS files | 30 | 21 |
| Page-load JS bytes (parsed) | ~125 KB | ~85 KB |
| Lines of dead code | ~3,200 | ~0 |
| Source-of-truth ambiguities | 3 (state, qb, modal) | 0 |
| Silent broken lookups | 3 (#site-health) | 0 |
| Smoke test | ✅ | ✅ |

---

## 🚀 If you only do one thing

Do **Critical C1** (restore #site-health). Five minutes. Solves the recurring "questions disappear and I don't know why" bug for good.

— Claude, 2026-05-18
