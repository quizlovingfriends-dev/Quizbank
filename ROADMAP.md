# QuizVault — Master Roadmap

Last updated: 2026-05-03

This is the single source of truth for what QuizVault is, what it'll become,
and the order things get built.

---

## 1. Identity

| Question | Your answer |
|---|---|
| Who's the audience? | Eventually everyone in the world. For now: just you. |
| Use frequency | Daily |
| Device | Laptop / PC only (mobile deferred) |
| Endgame | Public website + portfolio piece for CV |
| Top concern | A decent quiz bank that doesn't repeat questions constantly |

## 2. Content rules

| Rule | What it means |
|---|---|
| A "perfect" question | `Question + Answer + Funda + Image` |
| Fundas | I'll generate via Gemini AI when API works (you've asked for these) |
| Difficulty | Auto-detected via AI (Easy/Medium/Hard) |
| Image importance | Very, very important — every question should have one |
| Topics | sports / wildlife / current-affairs / history / politics / cuisines / general |

## 3. Practice mode rules

| Behaviour | Decision |
|---|---|
| Input style | User types answer → site checks if correct |
| Modes | Timed AND Endless (toggle) |
| Spaced repetition | Missed questions return after 15 questions |
| Timer | Real countdown per question |

## 4. Automation pipeline

| Setting | Value |
|---|---|
| Upload frequency | Roughly every 3 days |
| File formats | PDF or PPTX |
| Approval flow | Auto-add (no manual review). The pipeline must be bullet-proof. |
| OCR errors | Auto-fixed by AI (when Gemini works) |

## 5. Visual

- 100% committed to GX Boy / Berry aesthetic for now
- Themes available as previews: Aura purple, Carbon minimal, Synthwave, Brutalist
- Two-theme toggle (Berry for fun, Carbon for CV) — **deferred**

---

# 📋 Phased Roadmap

## 🔴 Phase 1 — Stability & Trust (THIS WEEK)

These directly target your "auto-added, you should be good enough to make no errors"
+ "annoyed by bugs" answers.

| # | Item | Status |
|---|---|---|
| 1.1 | Pin `data/questions.js` script tags with "DO NOT REMOVE" markers in HTML so editors don't strip them | TODO |
| 1.2 | Self-healing watcher — auto-restart on crash, runs as Windows scheduled task | TODO |
| 1.3 | Tighter dedup (fuzzy match against last 200 Qs) when auto-adding | TODO |
| 1.4 | One-command deploy script (`python deploy.py`): smoke test → zip → open Netlify | TODO |
| 1.5 | Updated smoke test now matching new HTML structure | DONE |
| 1.6 | `qb.js` for the new question bank layout | DONE |
| 1.7 | `home.js` for the new home layout | DONE |

## 🟠 Phase 2 — Content Quality (once Gemini works)

Targets fundas + autofix + no errors.

| # | Item | Cost estimate |
|---|---|---|
| 2.1 | AI-generate fundas for every question that doesn't have one | ~$0.15 one-time |
| 2.2 | AI cleanup of OCR garbage tokens (`oxymRIC`, `Hedetnhsokeht`, etc.) | ~$0.10 one-time |
| 2.3 | AI difficulty auto-rating (Easy/Med/Hard) | ~$0.10 one-time |
| 2.4 | Image enforcement — Pexels-fetched fallback if no image extracted | Free tier |

**Local fallback (no Gemini needed)** — see Section 7 below.

## 🟡 Phase 3 — Practice Mode (next week)

| # | Item | Status |
|---|---|---|
| 3.1 | Polish type-answer practice (smart matching) | Partially done |
| 3.2 | Timed mode with real countdown bar | TODO |
| 3.3 | Endless mode toggle | TODO |
| 3.4 | Spaced repetition: missed Q reappears after 15 | TODO |
| 3.5 | Per-question visual timer (red zone last 10s) | TODO |
| 3.6 | "Did I get it right?" override button (in case auto-check is wrong) | TODO |

## 🟢 Phase 4 — Public Launch Prep (2–3 weeks)

The CV-ready phase.

| # | Item |
|---|---|
| 4.1 | Custom Netlify domain (free `quizvault.netlify.app` or $1 `.xyz`) |
| 4.2 | OpenGraph cards for nice WhatsApp/Twitter previews |
| 4.3 | Footer credit "Made by [you]" with link to your other work |
| 4.4 | README.md on GitHub explaining architecture, OCR pipeline, design system — the artifact recruiters read |
| 4.5 | Theme toggle (GX Berry ↔ Carbon for "professional view") |

## 🔵 Phase 5 — Social / Sharing (later — you said remind me)

| # | Item | Reminder |
|---|---|---|
| 5.1 | Challenge a friend — generate a 5-Q link | Remind once Phase 4 done |
| 5.2 | Public leaderboard | Remind once Phase 4 done |
| 5.3 | Daily quiz — same 5 Qs for everyone today, share emoji results | Remind once Phase 4 done |
| 5.4 | Mobile responsive layout | Remind when site goes public |

---

## 6. Theme options (saved for later)

Available as previews at `themes/index.html`:

| Theme | Vibe | When to consider |
|---|---|---|
| **GX Berry** ✓ current | Pink-on-black, glitch, retro arcade | Now |
| **Aura purple** | Vivid violet `#B53DFC`, ethereal glow | If you tire of pink |
| **Carbon** | Clean off-white on near-black | When showing recruiters / CV |
| **Synthwave** | Hot pink + cyan + sunset grid | If you want full 80s |
| **Brutalist** | Mono, hard borders, no decoration | If you want devs to take you seriously |

---

## 7. What we can do RIGHT NOW without Gemini

If Gemini billing blocks you, here's the local-only path:

| # | Local alternative | Replaces |
|---|---|---|
| 7.1 | Better regex-based OCR cleaner (ALL caps→Title, `oxymRIC`→`Olympic`) | AI cleanup |
| 7.2 | Funda template: "More info coming soon" placeholder, manually edit later | AI fundas |
| 7.3 | Topic auto-classifier with expanded keyword dictionary (200+ keywords) | AI topic detection |
| 7.4 | Pexels API for fallback images (free, 200/hr) | AI image generation |
| 7.5 | Length-based difficulty heuristic (short answer = Easy, long descriptive = Hard) | AI difficulty |
| 7.6 | Manual "review queue" page — you eyeball low-quality questions | AI quality check |

These cover ~70% of what Gemini would do, just less elegantly.

---

## 8. Why Gemini API isn't working (full notes)

When tested, Google returned `limit: 0` for free tier on this project.
Possible reasons (any one or more):

1. **Region restriction** — some regions get $0 free tier on Gemini 2.0
2. **New project warm-up** — sometimes takes 24h to activate
3. **Billing not linked** — Google now requires a billing account on file even
   for free tier (verification, not charge)

**Fix that always works (5 min):**
1. Go to https://console.cloud.google.com/billing
2. Click "Link a billing account"
3. Add a credit/debit card
4. Set a $0 budget alert so they literally cannot charge you

The free quota (~1500 requests/day) is enough for 50 quiz files/day extraction.

---

## 9. Deferred / parking lot

Things mentioned but not yet scheduled:

- Mobile responsive layout
- "Challenge a friend" feature
- Public leaderboard
- Daily quiz with shareable emoji results
- Slideshare scraper integration with watcher
- Multiple language support

---

## 10. Done so far

- ✅ Watcher + extractor + questions_updater Python pipeline
- ✅ ODF / PPTX / PDF support
- ✅ EasyOCR fallback for image-based slides
- ✅ Slideshare scraper script
- ✅ Smoke test before deploy
- ✅ Health check script (scores quality 0-100)
- ✅ XSS sanitizer
- ✅ Safe localStorage (corruption recovery)
- ✅ Schema versioning
- ✅ Duplicate detection in updater
- ✅ Strict validation pipeline (rejects bad questions)
- ✅ GSAP animations module (single owner, idempotent)
- ✅ Question health scoring + cleanup script
- ✅ All 4 theme demo pages
- ✅ This document

---

*Document maintained by Claude. Update it whenever priorities shift.*
