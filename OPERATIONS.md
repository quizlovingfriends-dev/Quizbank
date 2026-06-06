# 📖 QuizVault — Operations Manual

Last updated: 2026-06-06

This is the practical "how do I work this thing?" guide. Bookmark it.

---

## 🚦 The 5 daily workflows

### A — "I have a new quiz PDF/PPTX to add"

```
1. Drop file:           D:\QUIZBANK\quiz-automator\input\
2. Start watcher:       double-click watcher_service.bat
3. Wait 5-10 minutes
4. Open in browser:     admin-review.html
5. Review pending items, click APPROVE / DISCARD per question
6. Click EXPORT_DECISIONS — saves approvals_*.json
7. Apply:               python scripts/apply_approvals.py approvals_*.json
8. Deploy:              git add . && git commit -m "..." && git push
9. Site updates         ~60 seconds later
```

Time per quiz file: roughly **2-5 minutes of your attention**.

### B — "I want to bulk-generate AI questions"

```bash
# Generate + save to data/ but DON'T merge yet (review first):
python scripts/generate_questions.py --topic "ancient egypt" --count 30 --difficulty hard

# Or generate + auto-pipe through the quality gate:
python scripts/generate_questions.py --topic "indian cricket" --count 50 --apply

# Or just preview without saving:
python scripts/generate_questions.py --topic "spices" --count 5 --dry-run
```

**Honest caveat:** AI questions need eyeballs. See the "AI question trust" section below.

### C — "I want to check current site quality"

```bash
python scripts/health_check.py
```
Outputs: total questions, perfect (100/100), healthy (≥80), and which need review.

### D — "I want to deploy"

After GitHub + Netlify are wired:
```bash
git add .
git commit -m "what changed"
git push
```
Netlify auto-rebuilds within 60 seconds.

### E — "Something broke"

```bash
python scripts/smoke_test.py
```
Reports broken script tags, missing images, JS syntax errors, dead refs. Fix what it complains about, re-run, push.

---

## 💰 What it costs to run

| Service | Free tier | What we use | Will you hit the limit? |
|---|---|---|---|
| Netlify hosting | 100 GB bandwidth/month | ~10 MB/visit | No |
| Supabase (cloud sync) | 500 MB DB + unlimited auth | Tiny JSON blobs | No |
| GitHub Models GPT-4o-mini | ~150K tokens/day | ~500 tokens/question | No (covers ~300 questions/day for free) |
| Pexels (images) | 200 req/hr, 20K/month | Bursts during enrichment | No |
| Wikipedia REST | Effectively unlimited | Funda + image lookup | No |
| Custom domain (optional) | — | $1-12/year | Optional |

**Total: $0/month**, optionally $10/year for a domain. Free forever for your use case.

---

## 🤖 AI question trust — the honest truth

**You are right to be skeptical of AI-generated content.**

| Curated quiz files (your PPTX) | AI-generated questions |
|---|---|
| Researched, lateral, surprising | Predictable subjects, surface-level |
| Cannot be hallucinated (was verified at write time) | **~3-5% of GPT factual claims are subtly wrong** |
| Each question = small piece of art | Each question = textbook entry |

### Best practice for AI generation

1. **Use AI for breadth**: bulk-fill topics where you want many easy-medium questions
2. **Use curated files for depth**: the showcase questions visitors will share
3. **Never auto-publish AI to public site** without spot-checking — always route through the pending queue
4. **Hard-difficulty AI questions need extra scrutiny** — that's where hallucinations hurt most

### The fix we can apply

The quality gate can be made source-aware:
- PPTX extraction → score-based (≥80 auto-publishes)
- AI generation → **always pending**, regardless of score
- Community submission → always pending

Ask Claude to build this — takes 5 minutes.

---

## 🗂 What's in your toolkit (scripts in `quiz-automator/scripts/`)

| Script | What it does | When to run |
|---|---|---|
| `watcher.py` (via `watcher_service.bat`) | Watches input/ folder, processes new quiz files | Always running |
| `extractor.py` | Extracts Q/A/funda from PDF/PPTX (with OCR fallback) | Called by watcher |
| `questions_updater.py` | Adds new questions to questions.js via quality gate | Called by watcher |
| `quality_gate.py` | Scores each question, routes to live or pending | Called by updater |
| `pending_queue.py` | Read/write helpers for pending_questions.json | Library |
| `apply_approvals.py` | Merges your approved edits into questions.js | After admin-review |
| `generate_questions.py` | AI question generator (GPT-4o-mini) | When you want bulk AI questions |
| `health_check.py` | Quality audit of all current questions | Anytime, especially before launch |
| `smoke_test.py` | Pre-deploy validation: parses JS, checks refs, etc | Before every deploy |
| `deploy.py` | Builds zip + opens Netlify (legacy — auto-deploy replaces it) | Mostly retired now |
| `enrich_fundas_github.py` | Re-generates missing fundas via GPT-4o-mini | When you have many empty fundas |
| `enrich_all.py` | Wikipedia + Pexels image enrichment | After bulk question additions |
| `enrich_lists.py` | Auto-generates "related mental lists" per question | Anytime; safe to re-run |
| `fix_data_bugs.py` | One-off OCR cleanup pass | Run after a messy extraction |

---

## 🎨 What's on the frontend

| URL | What it is |
|---|---|
| `index.html` | Home page — hero, stats, START_PRACTICE |
| `questionbank.html` | Browse all questions, filter, search |
| `wiki.html` | Saved-knowledge page (your bookmarked questions) |
| `analytics.html` | Real practice stats (no fake data) |
| `how-to-use.html` | Your methodology page — "Lists are the unit of quiz knowledge" |
| `admin-review.html` | Pending question review queue (use locally) |
| `404.html` | Brutalist 404 page |

---

## 🔐 Security model

- **API keys live in `quiz-automator/config.json`** (git-ignored, never pushed)
- **Supabase publishable key** is safe to commit (designed for client-side)
- **GitHub Personal Access Token** stays in config.json only
- **Pexels key** also in config.json
- The `.gitignore` blocks anything that contains a key from being committed

If you accidentally commit a key:
1. Revoke that key immediately on the service (GitHub → Settings → Tokens, Pexels → API page)
2. Generate a new one
3. Put it in config.json (still local-only)
4. The old one is dead, the leak is harmless

---

## 🆘 Common problems & fixes

| Problem | Fix |
|---|---|
| Watcher isn't picking up files | Make sure `watcher_service.bat` is running. Check `quiz-automator/logs/` for errors. |
| New questions don't appear after `git push` | Check Netlify dashboard for build status. If failed, check the build log. Most common cause: JS syntax error. Run `smoke_test.py` first. |
| `admin-review.html` says "no pending" but I know there are some | Hard-refresh (Ctrl+F5). The file is fetched fresh on every load. |
| `apply_approvals.py` says "failed JS validation" | The proposed edit broke `questions.js`. Original file untouched. Look at the error, fix the edit content in the approvals JSON, re-run. |
| Pexels API returns 403 | Cloudflare bot block. The script handles this with a User-Agent. If it persists, your firewall is interfering. |
| GitHub Models returns 429 | Free-tier rate limit. Script auto-waits 30-60s. Wait it out. |

---

## 📞 When to ask Claude vs Antigravity

| Task | Best tool |
|---|---|
| One specific surgical change | Claude (me) |
| Verifying existing claims | Claude |
| Writing tests / running smoke tests | Claude |
| Big visual overhauls / new theme | Antigravity (with strict non-regression contract) |
| Adding entire new pages / features | Either, but Antigravity if you want it autonomous |
| Debugging when something silently broke | Claude |

---

## 📜 Backups

Every time a script touches `questions.js`, it writes a `.bak` file:
- `data/questions.js.apply_<timestamp>.bak` — pre-apply_approvals
- `data/questions.js.github_<timestamp>.bak` — pre-funda-generation
- `data/questions.js.enrich_<timestamp>.bak` — pre-image-enrichment

These are git-ignored. They live forever on your local disk. To restore:
```bash
cp data/questions.js.apply_20260606_120000.bak data/questions.js
```

---

That's it. This file is your single source of truth for operating QuizVault. If something's not in here, ask.
