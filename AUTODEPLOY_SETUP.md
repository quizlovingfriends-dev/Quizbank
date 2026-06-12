# 🚀 Auto-Deploy Setup — YOUR 4 Clicks

The local Git repo is ready. From here, you do four things. Total time: ~10 min. Then you never touch `deploy.py` again.

---

## Click 1 — Create the GitHub repo (2 min)

1. Open **https://github.com/new** in your browser
2. Sign in if you're not (use your existing GitHub account — same one you used for the GitHub Models API key)
3. Repository name: `quizvault`
4. Description: "Brutalist GK question bank with smart practice mode"
5. **Visibility: Public** (you want this on your CV) OR Private (if you're not ready)
6. **DO NOT** check "Add a README" / "Add .gitignore" / "Choose a license" — we already have all three locally and they'd conflict
7. Click **Create repository**
8. You'll see a "Quick setup" page with a URL like `https://github.com/YOURNAME/quizvault.git` — **copy that URL**

---

## Click 2 — Push the local repo to GitHub (1 min)

Open PowerShell, paste these 3 commands one by one (replace `YOURNAME` with your actual GitHub username):

```powershell
cd D:\QUIZBANK
git remote add origin https://github.com/YOURNAME/quizvault.git
git branch -M main
git push -u origin main
```

It'll ask for your GitHub username + a Personal Access Token (NOT your password — GitHub doesn't accept passwords anymore). You already have a PAT from when we set up GitHub Models — that same `ghp_...` token works as your push password.

After 30-60 seconds: refresh your GitHub repo page. You should see all your files.

---

## Click 3 — Connect Netlify to GitHub (3 min)

1. Open **https://app.netlify.com/teams** (sign in with the same email you used for Netlify Drop earlier)
2. Top right → **Add new site** → **Import an existing project**
3. Click **Deploy with GitHub**
4. Authorize Netlify to read your GitHub repos (one-time consent screen)
5. Pick your `quizvault` repo from the list
6. Branch to deploy: **main**
7. **Build settings:**
   - Build command: (leave empty)
   - Publish directory: `.`
   - Functions directory: (leave empty)
8. Click **Deploy quizvault**
9. Watch the build log — should finish in 30-60 seconds with "Site is live"

You'll get a URL like `https://amazing-bunny-12345.netlify.app`. That's your live site.

---

## Click 4 — Rename the Netlify site to something memorable (1 min)

1. In your Netlify dashboard, click your new site → **Site settings**
2. Click **Change site name**
3. Type: `quizvault` (if available) or `quizvault-yourname`
4. Save

Your URL becomes `https://quizvault.netlify.app` (or similar).

---

## ✅ How auto-deploy works from now on

Anytime you (or I, or Antigravity, or a future contributor) change anything in `D:\QUIZBANK` and want it live:

```powershell
cd D:\QUIZBANK
git add .
git commit -m "describe what you changed"
git push
```

That's it. Netlify watches your `main` branch and rebuilds the site automatically within 60 seconds of every push. You'll get an email when the deploy succeeds.

**You never touch `deploy.py` or drag a zip again.**

---

## What about the Python pipeline (quiz-automator)?

Still works exactly the same. You drop a PDF/PPTX into `quiz-automator/input/`, the watcher processes it, `data/questions.js` gets updated. Then you just:

```powershell
cd D:\QUIZBANK
git add data/questions.js images/
git commit -m "add 23 new questions from aviation quiz.pptx"
git push
```

Site auto-updates in 60 seconds with the new questions visible.

---

## What happens to your API keys (config.json)?

**They never get pushed.** `.gitignore` blocks `quiz-automator/config.json`. Your GitHub repo is safe. If you ever set the project up on a new machine, copy `config.example.json` → `config.json` and refill the keys.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `git push` rejected — "no permission" | You're using your GitHub password. Use the `ghp_...` PAT as the password instead. |
| Netlify build says "Build failed" | Click the failed build, read the log. Most common cause: a `<script src="missing.js">` in HTML. Smoke test should have caught it — run `python quiz-automator/scripts/smoke_test.py` locally first. |
| Site is live but shows wrong stuff | Hard refresh: Ctrl+F5 (cache bust) |
| Site is live but `quiz-automator/scripts/watcher.py` is accessible via URL | Already blocked. `netlify.toml` redirects `/quiz-automator/*` to 404. |

---

## What I did locally

- Initialized git repo with 2 commits
- Wrote `.gitignore` (excludes 380MB of bloat)
- Wrote `netlify.toml` (build config + security headers + cache rules)
- Wrote `config.example.json` (template for API keys)
- Repo size: 15 MB

When you push to GitHub + connect Netlify, the site goes live within minutes. Permanently.

---

When done, come back here and say **"deployed"**. We move to Project A (Quality Gate Pipeline).
