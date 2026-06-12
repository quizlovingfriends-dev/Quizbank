# QuizVault — The Next 6 Months

Last updated: 2026-05-19

A realistic, honest plan to turn QuizVault from "a working prototype" into a serious learning product with a community and (optionally) a book.

---

## Where you actually are right now

| | Status |
|---|---|
| Questions | 200 (110 perfect, 197 healthy) |
| Deployed to public URL | ❌ Not yet — zip is built, you need to drag onto Netlify |
| Custom domain | ❌ Still `*.netlify.app` |
| Cloud sync | ✅ Anonymous, browser-bound |
| User accounts (email) | ❌ |
| Community submission flow | ❌ |
| Mobile tested in production | ❌ |
| Image quality (matching content) | ⚠️ ~60% are decent, ~40% are random Pexels stock |
| Content quality control process | ⚠️ Just the health_check script |
| Lists feature (your new idea) | ❌ |
| "How to use this site" methodology page | ❌ |
| Book / PDF companion | ❌ |
| Author identity / branding | ❌ |

**Honest summary:** the technical foundation is solid. The content + community + product layers are not.

---

## The 4-month plan

Each month has a **goal**, **why it matters**, **what gets built**, and **decisions you need to make at the end** before moving on.

---

## 🟢 Month 1 — Foundation & Identity

**Goal:** Make the site genuinely useful. Real URL, clean content, your voice.

**Why first:** No point growing a community on top of broken content. Fix the core experience before anyone sees it.

### Tasks (in order)

| Week | Task | Owner | Effort |
|---|---|---|---|
| 1 | **Deploy to Netlify** — drag the zip, get the URL | You | 2 min |
| 1 | **Custom domain** — buy `quizvault.in` or `.xyz` ($1-10/yr), point at Netlify | You + me to wire | 30 min |
| 1 | **Real mobile test** — open URL on phone, take screenshots, list what's wrong | You | 30 min |
| 1 | **Mobile fixes** — based on your screenshots | Me | 1-2 hrs |
| 2 | **Content audit** — flag every question with bad OCR, wrong image, missing funda | Me (script) | 1 hr |
| 2 | **Bulk content fix** — feed flagged questions back through GPT-4o-mini for cleanup | Me | 2 hrs |
| 2 | **Image quality pass** — replace random Pexels images with no-image or curated alternatives | Me (script) | 2 hrs |
| 3 | **Lists feature** — auto-generate "related lists" for every question, render under each card, new /lists page | Me | 1 day |
| 3 | **Methodology page** — "How to use QuizVault" written in your voice (you draft, I format) | You + me | 2 hrs |
| 4 | **Author identity** — your name in footer + a brief /about page (who built this, why) | You + me | 1 hr |
| 4 | **First friend test** — send the URL to 3-5 friends, ask them to use it for a week | You | passive |

**Decision at end of Month 1:**
- Is the content quality good enough to invite strangers in?
- If yes → move to Month 2 (community)
- If no → another content pass before opening up

**Cost:** ~$10 (domain) + ~$2 in GitHub Models API for content cleanup

---

## 🟡 Month 2 — Community & Trust

**Goal:** Let other people contribute questions without breaking everything.

**Why:** 200 questions is fine for one person. 1,000+ needs many contributors. But if any random person can edit the live data, it becomes garbage in a day. You need a moderation pipeline.

### The submission flow (the design)

```
PUBLIC USER
   ↓
   [Submit a question form on /submit page]
   ↓
   Stored in Supabase `submissions` table (NOT in questions.js yet)
   ↓
YOU (admin)
   ↓
   [Open /admin page → see queue of submissions]
   ↓
   For each: Approve / Edit-then-approve / Reject
   ↓
   Approved → auto-pushed to questions.js via the existing pipeline
   ↓
   Site auto-redeploys (Netlify build hook)
```

### Tasks

| Week | Task | Owner | Effort |
|---|---|---|---|
| 1 | **Supabase auth** — email magic-link sign-in (upgrade from anonymous) | Me | 2 hrs |
| 1 | **`submissions` table in Supabase** — schema + RLS policies | Me (you click "Run SQL") | 1 hr |
| 1 | **/submit page** — form for question + answer + funda + source + submitter name | Me | 3 hrs |
| 2 | **Admin queue** — `/admin?key=YOURTOKEN` shows pending submissions, you approve/reject | Me | 4 hrs |
| 2 | **Approval pipeline** — approved submission → Python script → questions.js → git commit → Netlify rebuild | Me (you set up Netlify webhook) | 3 hrs |
| 3 | **Quality scoring on submission** — auto-reject if OCR-noise, too-short, duplicate. Use existing health_check logic | Me | 2 hrs |
| 3 | **Contributor credits** — each question stores submitter name, show "Submitted by X" on the card | Me | 1 hr |
| 4 | **Public invite** — share the URL on 1 quiz community (Reddit /r/quizzes? Indian quiz Discord? Twitter?) | You | passive |

**Decision at end of Month 2:**
- Are submissions coming in? At what rate?
- Is the quality acceptable?
- Are users coming back?

**Cost:** $0 (everything is in Supabase free tier + GitHub Models free tier)

---

## 🟠 Month 3 — Depth & The Book

**Goal:** 1,000+ questions. Better topics. PDF book launches.

**Why:** Scale is what separates "a side project" from "a real resource." And the book gives you a tangible artifact + potential revenue stream.

### Content scaling

You can't manually type 800 more questions. Three sources:

1. **More quiz files** — drop more PDFs/PPTXs in `input/`, watcher processes them automatically (~50 questions per file)
2. **AI-generated questions** — use GPT-4o-mini to generate brand-new questions on topics you specify ("give me 20 hard questions about ancient Indian dynasties")
3. **Community submissions** — flowing in from Month 2

Target mix: 40% sourced, 30% AI-generated, 30% community.

### The book

| Aspect | Plan |
|---|---|
| **Format** | PDF first (free download), print-on-demand later via KDP if traction |
| **Content** | Selected best 500 questions, grouped by topic, full fundas, all the "Lists" feature attached |
| **Style** | Same brutalist aesthetic as site (you have the design system already) |
| **Pages** | ~250-300 pages |
| **Generation** | Python script using `weasyprint` reads from questions.js → produces a styled PDF |
| **Pricing** | Free download for now. Premium "Annotated Edition" later if site has 1k+ regulars |

### Tasks

| Week | Task | Owner | Effort |
|---|---|---|---|
| 1 | **AI question generator** — `generate_questions.py topic=ancient-india count=20 difficulty=hard` | Me | 4 hrs |
| 1-4 | **Upload 8-10 quiz files** to `input/`, let watcher process | You | passive |
| 2 | **PDF generator** — Python script: questions.js → styled PDF | Me | 1 day |
| 2 | **PDF cover + intro pages** — written by you, designed brutalist | You + me | 4 hrs |
| 3 | **Book v1** — ~250 pages, downloadable from site | Me | 1 day |
| 3 | **Topic expansion** — add Science, Geography, Literature, Movies as real topics (currently fuzzy) | Me | 4 hrs |
| 4 | **Reach 500 questions** | Pipeline | passive |

**Decision at end of Month 3:**
- Has the book had any downloads?
- Are users coming back daily?
- Is one specific topic clearly more popular?

**Cost:** ~$5-10 in API for AI generation

---

## 🔴 Month 4 — Growth, Polish, Maybe Money

**Goal:** Get to 1,000 daily-active users (DAU) or a clear no.

**Why:** This is where you find out if it's a hobby or a product. Either answer is fine, but you need to know.

### Tasks

| Week | Task | Owner | Effort |
|---|---|---|---|
| 1 | **SEO push** — fix titles, descriptions, OG cards per page; submit sitemap to Google | Me | 1 day |
| 1 | **Lighthouse 95+** across all pages | Me | 1 day |
| 2 | **Sharing mechanics** — "share this question" makes a pretty card image, deep link works | Me | 1 day |
| 2 | **Daily email** — opt-in. "Today's 5 questions" sent at 8 AM | Me (uses Supabase + a free email service like Resend) | 1 day |
| 3 | **Leaderboard** — opt-in. Top 10 weekly accuracy + streaks | Me | 1 day |
| 3 | **Quiz battles** — share a link to challenge a friend with same 5 questions, see who wins | Me | 2 days |
| 4 | **First real launch** — Product Hunt? HackerNews? Indian quiz forums? | You | 1 day |

### Money decisions (if you want)

| Option | How | Realistic |
|---|---|---|
| **Free forever, donations** | "Buy me a coffee" link | Low income, low effort, good for portfolio |
| **Freemium** | Free 50 questions/day, $5/mo for unlimited + book + battles | Requires 100+ paying users to matter |
| **Sponsored questions** | Brands pay to add their question. "Brought to you by X" | Hard to land, but high-margin |
| **Book sales** | Premium edition $15 on Gumroad | Few sales unless site has audience |

**Honest truth:** at 6 months in, you'll likely have 50-200 users, not 1,000. That's still a successful student project. Money makes sense only at 5k+ DAU.

**Cost:** ~$20 across Resend (email) + Gumroad (if you sell book) + domain renewal

---

## 📚 Should you make a book? — Long answer

**Yes, but as a complement, not a replacement.**

### Why a book is good

- **Tangible artifact** — "I wrote a 300-page book on competitive quizzing" is a much stronger CV signal than "I made a website"
- **Sellable** — Even at low volume, $15 × 100 sales = $1,500. Lifetime income, not maintenance income.
- **Gift-able** — Friends/parents/teachers will buy. Reach beyond quiz nerds.
- **No-internet** — Trains, planes, study halls.
- **Press hook** — "Local quiz enthusiast publishes book" gets you in college newsletters, local papers, podcasts.

### Why not a book

- **Frozen** — Once printed, can't update. Errata pile up.
- **Maintenance overhead** — Reprints, KDP, royalties, returns.
- **Audience mismatch** — Website users want practice mode + spaced repetition; book users want passive reading. Different needs.

### The smart play

1. **Free PDF first.** Auto-generated from questions.js every month. "QuizVault Companion v3" downloadable from the site. Costs you nothing. Builds trust.

2. **Print-on-demand if traction.** Once you've had 500+ PDF downloads and the website has regulars, do a KDP paperback. ~6 weeks setup, near-zero upfront cost.

3. **Don't make the book the goal.** The website is the active learning tool. The book is the memento.

---

## 🎯 The decisions I need you to make right now (don't decide today — sleep on it)

| Question | What to know |
|---|---|
| **Do you want this as a portfolio piece or a real product?** | Portfolio = ship Month 1, polish, move on. Product = commit 6+ months. |
| **Are you OK being the public face?** | Community submissions need someone to moderate. That's you. |
| **Custom domain or `.netlify.app`?** | Domain = $10/yr, signals seriousness. Netlify subdomain = free, signals "side project." |
| **Free forever or paid tier?** | Free is easier and more honest at this stage. Add paid only if there's genuine demand. |
| **Book strategy: free PDF, premium PDF, or print?** | I recommend free PDF until 500 downloads, then revisit. |

---

## What I think you should actually do this week

In order:

1. **Deploy.** Run `deploy.py`, drag the zip to Netlify. Get the URL. Stop iterating without a live site.
2. **Open the URL on your phone right now.** Screenshot anything that looks broken.
3. **Send the URL to 3 friends** who'd actually use it. Ask for honest feedback.
4. **Wait 48 hours, gather feedback.**
5. **Then come back to me with specific things to fix.**

Right now you're building in a vacuum. Get real usage data first, then plan Month 1 properly.

---

## What I'll do in parallel

While you do the above, I'll:

1. **Write `enrich_lists.py`** — the auto-list-generation pipeline (covered in Month 1 above). Don't run it until you say.
2. **Draft a `how-to-use.html` page** — methodology explained, your "lists as the unit of quiz knowledge" idea
3. **Audit content for remaining bugs** — produce a list of questions still needing manual fixes

So when you come back from the friend feedback, we have:
- Lists feature ready to deploy
- Methodology page ready to edit
- Specific bug list to fix based on YOUR friends' feedback + my audit

---

## The TL;DR

| Month | Focus | Cost | Key milestone |
|---|---|---|---|
| 1 | Foundation + identity | $10 | Site live, friends using it, Lists shipped |
| 2 | Community submissions | $0 | First 10 community-submitted questions live |
| 3 | Scale + book | $10 | 500 questions, free PDF download |
| 4 | Growth + money decision | $20 | 200+ users OR clear "this is a hobby" answer |

**Total cost over 4 months: ~$40.** Time on your end: ~5 hours/week.

Don't try to do all of this at once. One phase at a time. Decisions at the end of each.

— Claude
