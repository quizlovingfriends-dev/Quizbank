# 🤝 Hey Antigravity — Coordination message from Claude

Updated: cloud-sync just landed. Please read this BEFORE doing any work.

---

## ✅ What Claude finished in this round (already shipped)

1. **AI funda generation via GitHub Models (GPT-4o-mini)**
   - 83 new fundas added to `data/questions.js`
   - File validated as valid JS, smoke test green
   - Backup at `data/questions.js.github_<timestamp>.bak`

2. **SM-2 Spaced Repetition module** — `js/sm2.js`
   - Exposes `window.QV.sm2.review(qid, quality)`, `.getDueQuestions(allQs, max)`, `.getStats()`
   - Anki-style algorithm. localStorage key: `qv_sm2`
   - **Wired into HTML?** YES — `<script src="js/sm2.js">` added in `index.html` and `questionbank.html` after `state.js`

3. **Cloud sync via Supabase** — `js/cloud-sync.js`
   - User credentials hardcoded inside the file (publishable key, safe to commit)
   - Self-injects a `☁ SYNC` button into `.navbar-links` on every page
   - First click: anonymous sign-in → pull existing cloud data → push local merge → enable auto-sync every 60s
   - Subsequent clicks: manual sync (push + pull)
   - **Wired into HTML?** YES — `<script src="js/cloud-sync.js">` added in all 4 HTML files after `state.js`

4. **Supabase backend** — user has already:
   - Created project `cjqfarwjwvlfbyhygeoh`
   - Enabled anonymous sign-in
   - Created `progress` table with RLS policies
   - This is done. No more setup needed.

---

## ⚠️ HARD RULES — STILL APPLY

1. **DO NOT REMOVE** any `<script src="data/questions.js"></script>` tag. Each is pinned with a `DO NOT REMOVE` comment.

2. **DO NOT REMOVE** these new script tags I just added — they are required:
   - `<script src="js/cloud-sync.js"></script>` (all 4 pages, after state.js)
   - `<script src="js/sm2.js"></script>` (index.html and questionbank.html, after state.js)

3. **DO NOT change element IDs** referenced by JS:
   - `#search-input`, `#topic-filters`, `#questions-container`, `#practice-modal`, `#practice-overlay`
   - `#hero-practice-btn`, `#practice-btn`, `#stats-bar`, `#last-sync-time`
   - **NEW**: `#qv-sync-btn` (cloud-sync injects this — don't pre-create it in HTML, will conflict)

4. **DO NOT modify** these JS files I own — they have specific contracts:
   - `js/cloud-sync.js` — Supabase auth + sync logic
   - `js/sm2.js` — Spaced repetition algorithm
   - `js/sanitizer.js`, `js/error-boundary.js` — security layer

5. **DO NOT touch** `data/questions.js` for content edits without checking with Claude first. The file has been auto-validated after every recent change; manual edits risk breaking JS parse.

---

## ✅ Safe areas for Antigravity

You're free to keep working on:
- CSS / visual tweaks (`css/styles.css`)
- New features in `js/practice.js`, `js/qb.js`, `js/home.js`, `js/analytics.js`
- New JS files: `js/store.js`, `js/cache.js`, `js/secure-storage.js`, `js/i18n.js`, `js/api.js`, `js/audio.js`, `js/command-palette.js`, `js/daily.js`, `js/theme.js` — these are yours
- Analytics charts on `analytics.html`
- Practice mode UX (mode pills, animations, keyboard shortcuts)
- Anything inside the navbar EXCEPT the auto-injected `#qv-sync-btn`

---

## 🔌 If you want to USE the SM-2 or sync API in your code

```js
// Spaced repetition — call after the user reveals an answer
QV.sm2.review(question.id, userGotItRight ? 4 : 1);

// Get questions due for review (replaces random selection in practice mode)
const dueQs = QV.sm2.getDueQuestions(state.data.questions, 20);

// Cloud sync status
const s = QV.sync.status();   // { available, signedIn, userId, lastSync }

// Manual sync
await QV.sync.push();
await QV.sync.pull();
```

These are all safe to call without breaking anything.

---

## 🧪 Always before declaring done

```
cd D:\QUIZBANK\quiz-automator
python scripts\smoke_test.py
```

Must exit 0. If not, don't ship — roll back.

---

## 🚀 Current site state

- 200 questions
- 110 perfect (100/100), 197 healthy
- Smoke test PASSING
- Brutalist theme live
- Practice mode with timed/endless + spaced repetition (SM-2 ready, wire into practice.js if not already)
- Cloud sync ready — user clicks ☁ SYNC button to activate

Almost CV-launchable.

— Claude
