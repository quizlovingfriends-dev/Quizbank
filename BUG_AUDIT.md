# 🐛 QuizVault — Bug Audit Report

Generated: 2026-05-19

This is a **complete inventory** of every quality issue across the 200 questions in `data/questions.js`. Use this to prioritize what to fix before publicly launching.

---

## Executive summary

| Metric | Count |
|---|---|
| Total questions | 200 |
| **Perfect (100/100)** | **110** ✅ |
| Healthy (≥80) | 197 |
| Below threshold (<100) | 90 |
| **Critically broken (needs immediate fix)** | **~12** |
| OK-but-imperfect (minor warnings) | ~78 |

**Translation:** 188 of 200 questions are publishable as-is. About 12 have real problems that look bad on the live site.

---

## 🔴 Critical bugs — MUST fix before launch

### 1. Broken YouTube/URL fragments in question text (3 questions)

The OCR captured `https://www.` followed by a space and then "youtube" — but the actual video URL got mangled. These are unanswerable as written.

**Affected:**

| ID | Topic | Question preview |
|---|---|---|
| 74 | general | `https://www. youtube. ID the instrument, which has a rather simple name.` |
| 112 | general | (needs review) |
| 125 | general | (needs review) |

**Fix options:**
- **A** — Manually find the original YouTube video and embed it (best, but tedious)
- **B** — Delete these 3 questions entirely (they're unanswerable now)
- **C** — Rewrite the question text to remove the URL reference and let the still-present answer + funda carry it
- **D** — Mark with `[Video link lost in OCR — refer to original quiz]` notice

**Recommended:** **B** — delete them. They're unfixable without going back to the source PPTX.

---

### 2. Truncated / nearly-empty answers (3 questions)

These have answers under 2 characters — basically empty.

**Affected IDs:** 159, 161, 162

**Fix:** Open each in the source, manually re-enter the correct answer. Or delete if source is lost.

---

### 3. Low alpha-ratio answers — OCR garbage (9 questions)

These answers are full of weird characters, garbled tokens, or non-alphabetic noise.

**Affected IDs:** 105, 139, 159, 161, 162, 165, 175, 195, 197

**Fix:** Manual review — clean up the noise. Most can probably be salvaged by reading the funda for context.

---

### 4. Invalid topic tags (2 questions)

Topics `geography` and `literature` aren't in the allowed list. The site currently filters them as "general" but the questionbank topic chip count looks wrong.

**Fix options:**
- **A** — Add `geography` and `literature` to the allowed topics list (better — they're legit GK categories)
- **B** — Relabel these as `history` or `general`

**Recommended:** **A** — open `js/state.js` ALLOWED_TOPICS and add both.

---

### 5. Date-stripped questions (2 questions)

Questions where OCR turned headers into garbage like `Date: 26. 04. 1986. Time: 1:23:58 AM.`

**Affected IDs:** 52, 62

**Fix:** Manual review — strip the date headers, clean up sentence structure.

---

## 🟡 Minor warnings — fine to leave

### Long answers (13 questions)

These trigger a warning for being >200 chars. But all are intentional — they're the "full explanation" answers from the original quiz.

**Affected IDs:** 3, 6, 8, 12, 17, 18, 20, 21, 24, 26, and a few more

**Verdict:** **No action needed.** Long detailed answers are a feature, not a bug.

### 1 OCR-noise token

Q20 has some leftover noise tokens. Cosmetic only.

---

## 🖼️ Image quality (separate issue — not in health_check)

Per the IMPROVEMENTS_REPORT, ~40% of the auto-fetched Pexels images don't actually match the question content (random stock photos of people, generic concepts). Health check doesn't detect this because they're "present" — but they look bad.

**Strategy options:**
- **A** — Manual sweep: for each question with an image, check if it's relevant. Delete or replace bad ones.
- **B** — Bulk-strip Pexels images and accept "no image" as the default
- **C** — Smarter enrichment: only fetch Wikipedia thumbnails (more contextual), skip Pexels for proper-noun answers

**Recommended:** **C** — re-run image enrichment with a stricter rule. I can write `fix_images_v2.py` that:
1. For each question with a Pexels image, checks if the answer is a proper noun (person/place/specific entity)
2. If yes → delete the Pexels image, retry Wikipedia
3. If Wikipedia also can't find it → leave imageless

---

## 🎯 Priority action plan

If you want the site polished for public launch, do these in order:

| Priority | Action | Effort | Affects |
|---|---|---|---|
| **P0** | Delete or fix the 3 broken YouTube URLs (Q74, Q112, Q125) | 5 min | Critical visible bug |
| **P0** | Delete or fix the 3 empty answers (Q159, Q161, Q162) | 10 min | Unanswerable |
| **P0** | Manually clean the 9 OCR-garbage answers | 20 min | Bad UX |
| **P1** | Add `geography` and `literature` to ALLOWED_TOPICS in state.js | 1 min | Topic chip counts |
| **P1** | Re-run image enrichment with strict rules | 15 min | ~80 questions get better images |
| **P2** | Fix the 2 date-header truncated questions | 5 min | Cosmetic |

**Total time to polish:** about 1 hour of manual work + 15 min of script running.

---

## 🛠️ Want me to do any of these automatically?

I can write and run:
- **`fix_critical.py`** — auto-delete Q74/112/125/159/161/162 (or you give me replacement text and I sub it in)
- **`fix_topics.py`** — add geography + literature to ALLOWED_TOPICS, recompute topic distribution
- **`fix_images_v2.py`** — strict re-enrichment, swap Pexels for Wikipedia where possible, drop irrelevant images
- **`enrich_lists.py`** — already written, ready to run

Just say which letter(s):
- **`fix critical`** — delete the unfixable 6 broken questions
- **`fix topics`** — add missing topics
- **`fix images`** — strict image re-enrichment
- **`enrich lists`** — run the lists enrichment (will take ~10 min, generates lists for all 200 questions)
- **`do all`** — run all of the above in order

Or tell me you want to handle the critical ones manually and I'll just leave them flagged.
