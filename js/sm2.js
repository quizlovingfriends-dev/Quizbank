/**
 * sm2.js — SuperMemo SM-2 Spaced Repetition implementation for QuizVault.
 *
 * The classic algorithm used by Anki, Mnemosyne, and Duolingo's earlier engines.
 * Tracks: easiness factor (EF), repetition count (n), interval (I) per question.
 *
 * Public API on window.QV.sm2:
 *   .review(qid, quality)      — record a review (0-5 quality, 0=worst)
 *   .nextDue(qid)              — next due timestamp (ms) for a question
 *   .getDueQuestions(allQs, max) — pool of questions ready for review
 *   .getStats()                — summary stats for analytics page
 *   .reset(qid)                — start a question over
 *
 * Storage: localStorage key 'qv_sm2' = { qid: {ef, n, i, due, lastReviewed} }
 */
(function() {
  const STORAGE_KEY = 'qv_sm2';
  const DAY_MS = 86_400_000;

  // ── State helpers ──────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) {}
  }

  function getCard(state, qid) {
    return state[qid] || {
      ef: 2.5,        // easiness factor — starts at 2.5
      n: 0,           // successful repetitions in a row
      i: 0,           // current interval in days
      due: Date.now(),// when this card is next due (ms timestamp)
      lastReviewed: null,
      lapses: 0,      // how many times the user failed it
    };
  }

  // ── Core SM-2 algorithm ────────────────────────────────────────────────────
  /**
   * quality: 0..5
   *   0 = total blackout
   *   1 = wrong, but recognized the right answer
   *   2 = wrong, but felt familiar
   *   3 = correct with serious effort
   *   4 = correct with hesitation
   *   5 = perfect recall
   * In our UI we map:
   *   "I missed it"    → 1
   *   "I got it"       → 4
   *   "I got it (easy)"→ 5
   */
  function applySM2(card, quality) {
    quality = Math.max(0, Math.min(5, quality | 0));

    if (quality < 3) {
      // Failed — reset interval to 1, but keep EF
      card.n = 0;
      card.i = 1;
      card.lapses = (card.lapses || 0) + 1;
    } else {
      // Passed
      if (card.n === 0)      card.i = 1;
      else if (card.n === 1) card.i = 6;
      else                   card.i = Math.round(card.i * card.ef);
      card.n += 1;
    }

    // Update EF (Hermann Ebbinghaus / Wozniak formula)
    card.ef = card.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.ef < 1.3) card.ef = 1.3; // floor

    card.lastReviewed = Date.now();
    card.due = Date.now() + card.i * DAY_MS;
    return card;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function review(qid, quality) {
    const state = load();
    const card = applySM2(getCard(state, qid), quality);
    state[qid] = card;
    save(state);
    return card;
  }

  function nextDue(qid) {
    const state = load();
    return (state[qid] && state[qid].due) || Date.now();
  }

  function isDue(qid) {
    return nextDue(qid) <= Date.now();
  }

  function getCardFor(qid) {
    const state = load();
    return getCard(state, qid);
  }

  /**
   * Return the most relevant pool of questions for the next practice session.
   * Priorities:
   *   1. Cards overdue (due < now), sorted by how overdue they are
   *   2. New cards (never reviewed)
   *   3. Cards due today
   */
  function getDueQuestions(allQuestions, maxCount) {
    maxCount = maxCount || 20;
    const state = load();
    const now = Date.now();

    const overdue = [];
    const newCards = [];
    const dueToday = [];

    allQuestions.forEach(q => {
      const card = state[q.id];
      if (!card) {
        newCards.push(q);
      } else if (card.due <= now - DAY_MS) {
        overdue.push({ q, lateBy: now - card.due });
      } else if (card.due <= now + DAY_MS) {
        dueToday.push(q);
      }
    });

    overdue.sort((a, b) => b.lateBy - a.lateBy);

    const pool = [
      ...overdue.map(o => o.q),
      ...newCards.slice(0, Math.max(5, Math.floor(maxCount * 0.3))),
      ...dueToday,
    ];

    return pool.slice(0, maxCount);
  }

  function getStats() {
    const state = load();
    const cards = Object.values(state);
    const now = Date.now();

    return {
      total:        cards.length,
      mature:       cards.filter(c => c.i >= 21).length,
      young:        cards.filter(c => c.i > 0 && c.i < 21).length,
      lapses:       cards.reduce((s, c) => s + (c.lapses || 0), 0),
      averageEF:    cards.length
                      ? +(cards.reduce((s, c) => s + c.ef, 0) / cards.length).toFixed(2)
                      : 2.5,
      overdueCount: cards.filter(c => c.due < now - DAY_MS).length,
      dueToday:     cards.filter(c => c.due <= now + DAY_MS).length,
    };
  }

  function reset(qid) {
    const state = load();
    delete state[qid];
    save(state);
  }

  function resetAll() {
    save({});
  }

  // Expose
  window.QV = window.QV || {};
  window.QV.sm2 = {
    review,
    nextDue,
    isDue,
    getCard: getCardFor,
    getDueQuestions,
    getStats,
    reset,
    resetAll,
  };
})();
