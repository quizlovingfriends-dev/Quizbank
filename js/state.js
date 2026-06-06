/**
 * state.js — Compatibility Wrapper
 *
 * Keeps the legacy `window.state` API intact while delegating to
 * the new Redux-style `window.QVStore`.
 *
 * Every existing call site (home.js, qb.js, practice.js, daily.js,
 * analytics.js) continues to work without modification.
 */

(function () {
  'use strict';

  // Wait for store.js to be loaded first
  if (!window.QVStore) {
    console.error('[state] store.js must be loaded before state.js');
    return;
  }

  var store   = window.QVStore;
  var Actions = window.QVActions;
  var Utils   = window.QVUtils;

  // ── Schema / Topic constants (unchanged) ─────────────────────────────────
  var ALLOWED_TOPICS = [
    'sports', 'wildlife', 'current-affairs', 'history',
    'politics', 'cuisines', 'science', 'literature', 'geography', 'general'
  ];

  // ── Legacy State Object ──────────────────────────────────────────────────
  var LegacyState = {

    // ── Proxy to store's data ────────────────────────────────────────────
    get data() {
      return store.getState();
    },

    // ── Listeners ────────────────────────────────────────────────────────
    listeners: [],

    subscribe: function (callback) {
      this.listeners.push(callback);
      store.subscribe(callback);
    },

    notify: function () {
      var s = store.getState();
      this.listeners.forEach(function (cb) { cb(s); });
    },

    // ── Fuzzy Match ──────────────────────────────────────────────────────
    fuzzyMatch: Utils.fuzzyMatch,

    // ── Filter Sync ──────────────────────────────────────────────────────
    filterSync: function (questions, filter, difficulty, query) {
      return Utils.filterQuestions(questions, filter, difficulty, query, store.getState().favorites);
    },

    // ── Load Questions (Item 3, 4, 9) ────────────────────────────────────
    loadQuestions: function () {
      const DATA_URL = 'data/questions.js'; // We'll parse the JS as text for now, or use JSON if available
      
      // Try cache first (Item 4)
      if (window.QVCache) {
        window.QVCache.get('questions_master').then(cached => {
          if (cached) {
            console.log('[state] Loaded questions from cache.');
            store.dispatch({ type: Actions.LOAD_QUESTIONS, payload: { questions: cached } });
            return;
          }
          this._fetchQuestions(DATA_URL);
        });
      } else {
        this._fetchQuestions(DATA_URL);
      }
    },

    _fetchQuestions: function (url) {
      // Fallback to global if fetch fails or while developing
      if (typeof QUIZ_QUESTIONS !== 'undefined' && QUIZ_QUESTIONS.length > 0) {
        console.log('[state] Using global QUIZ_QUESTIONS.');
        this._processAndStore(QUIZ_QUESTIONS);
        return;
      }

      fetch(url)
        .then(res => res.text())
        .then(text => {
          // Extract the array from "const QUIZ_QUESTIONS = [...]"
          const jsonStart = text.indexOf('[');
          const jsonEnd = text.lastIndexOf(']') + 1;
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const questions = JSON.parse(jsonStr);
          this._processAndStore(questions);
          
          // Save to cache (Item 4)
          if (window.QVCache) {
            window.QVCache.put('questions_master', questions);
          }
        })
        .catch(err => {
          console.error('[state] Fetch failed:', err);
          
          this._processAndStore([]);
        });
    },

    _processAndStore: function (raw) {
      if (!raw || raw.length === 0) {
        // Fallback set (Item 9)
        raw = [
          {
            id: 'fallback_1', topic: 'general', difficulty: 'easy',
            question: { text: 'What is the capital of France?' },
            answer: { text: '<strong>Paris</strong>' },
            funda: { text: 'Paris has been the capital of France since the 10th century.' }
          }
        ];
      }

      var validated = raw
        .map(function (q) { return window.state.validateQuestion(q); })
        .filter(function (q) { return q !== null; });

      store.dispatch({ type: Actions.LOAD_QUESTIONS, payload: { questions: validated } });
    },

    // ── Validate Question ────────────────────────────────────────────────
    validateQuestion: function (q) {
      try {
        var validQ = {
          id: q.id || Math.random().toString(36).substr(2, 9),
          topic: q.topic || 'general',
          difficulty: q.difficulty || 'medium',
          question: {
            text: (q.question && q.question.text) ? q.question.text : 'No question text provided.',
            image: (q.question && q.question.image) ? q.question.image : null
          },
          answer: {
            text: (q.answer && q.answer.text) ? q.answer.text : 'Answer hidden or missing.',
            image: (q.answer && q.answer.image) ? q.answer.image : null
          },
          funda: {
            text: (q.funda && q.funda.text) ? q.funda.text : '',
            image: (q.funda && q.funda.image) ? q.funda.image : null
          }
        };

        // Auto-detect topic if generic
        if (!ALLOWED_TOPICS.includes(validQ.topic) || validQ.topic === 'general') {
          var text = (validQ.question.text + ' ' + validQ.answer.text).toLowerCase();
          if (text.includes('cricket') || text.includes('football') || text.includes('olympic') || text.includes('player')) validQ.topic = 'sports';
          else if (text.includes('animal') || text.includes('species') || text.includes('forest') || text.includes('bird')) validQ.topic = 'wildlife';
          else if (text.includes('election') || text.includes('minister') || text.includes('parliament')) validQ.topic = 'politics';
          else if (text.includes('dish') || text.includes('food') || text.includes('chef') || text.includes('recipe')) validQ.topic = 'cuisines';
          else if (text.includes('century') || text.includes('empire') || text.includes('war') || text.includes('ancient')) validQ.topic = 'history';
          else if (text.includes('science') || text.includes('physics') || text.includes('biology') || text.includes('element')) validQ.topic = 'science';
          else if (text.includes('author') || text.includes('book') || text.includes('novel') || text.includes('poem')) validQ.topic = 'literature';
          else if (text.includes('capital') || text.includes('river') || text.includes('mountain') || text.includes('country')) validQ.topic = 'geography';
        }
        return validQ;
      } catch (e) {
        console.error('[state] Question validation failure:', e);
        return null;
      }
    },

    // ── Question Type Detection ──────────────────────────────────────────
    getQuestionType: function (q) {
      if (q.type) return q.type;
      var text = q.question.text || '';
      var rwLines = text.split('\n').filter(function (l) { return l.includes('RIGHT') || l.includes('WRONG'); });
      if (rwLines.length >= 2) return 'grid-flip';
      var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
      var hasClues = lines.some(function (l) { return /^CLUE\s*\d+/i.test(l); });
      var numberedLines = lines.filter(function (l) { return /^\d+[.\)]/.test(l); });
      if (hasClues || numberedLines.length >= 2) return 'progressive';
      return 'standard';
    },

    // ── State Mutations (delegated to store) ─────────────────────────────
    requestFilter: function () {
      store.dispatch({ type: Actions.SET_FILTER, payload: { filter: store.getState().currentFilter } });
    },

    updateFilter: function (filter) {
      store.dispatch({ type: Actions.SET_FILTER, payload: { filter: filter } });
    },

    updateDifficulty: function (diff) {
      store.dispatch({ type: Actions.SET_DIFFICULTY, payload: { difficulty: diff } });
    },

    updateSearch: function (query) {
      store.dispatch({ type: Actions.SET_SEARCH, payload: { query: query } });
    },

    toggleFavorite: function (id) {
      store.dispatch({ type: Actions.TOGGLE_FAVORITE, payload: { id: id } });
    },

    isFavorite: function (id) {
      return store.getState().favorites.indexOf(id) !== -1;
    },

    // ── Performance ──────────────────────────────────────────────────────
    recordResult: function (topic, isCorrect, points, questionId) {
      store.dispatch({
        type: Actions.RECORD_RESULT,
        payload: { topic: topic, isCorrect: isCorrect, points: points || 1, questionId: questionId }
      });
    },

    savePerformance: function () {
      store.dispatch({ type: Actions.SAVE_PERFORMANCE, payload: {} });
    },

    // ── Session History (Item 7) ─────────────────────────────────────────
    /**
     * @param {SessionRecord} session
     */
    recordSession: function (session) {
      store.dispatch({ type: Actions.RECORD_SESSION, payload: { session: session } });
    },

    getSessionHistory: function () {
      return store.getState().sessionHistory;
    },

    // ── Settings (Item 13) ───────────────────────────────────────────────
    updateSettings: function (partial) {
      store.dispatch({ type: Actions.UPDATE_SETTINGS, payload: partial });
    },

    getSettings: function () {
      return store.getState().settings;
    },

    // ── Spaced Repetition (Item 8) ───────────────────────────────────────
    getSpacedQuestions: function (questions) {
      var perf = store.getState().performance;
      return window.QVUtils.spacedRepetitionSort(questions || [], perf.weakQuestions || {});
    },

    // ── Daily Quiz ───────────────────────────────────────────────────────
    getDailyQuizPool: function () {
      var questions = store.getState().questions;
      if (questions.length === 0) return [];
      var today = new Date().toDateString();
      var seed = today.split('').reduce(function (acc, c) { return acc + c.charCodeAt(0); }, 0);
      var shuffled = questions.slice();
      for (var i = shuffled.length - 1; i > 0; i--) {
        var j = (seed * (i + 1)) % (i + 1);
        var temp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = temp;
      }
      return shuffled.slice(0, 5);
    },

    recordDailyResult: function (results) {
      store.dispatch({ type: Actions.RECORD_DAILY, payload: { results: results } });
    },

    // ── Wiki ─────────────────────────────────────────────────────────────
    saveToWiki: function (id) {
      var q = store.getState().questions.find(function (item) { return item.id === id; });
      if (!q) return;
      var wiki = Utils.safeJSON('qb_wiki') || {};
      wiki[id] = {
        title: q.question.text.substring(0, 50) + '...',
        answer: q.answer.text,
        funda: q.funda.text,
        topic: q.topic,
        savedAt: new Date().toISOString()
      };
      Utils.safeSet('qb_wiki', JSON.stringify(wiki));
      LegacyState.notify();
    },

    removeFromWiki: function (id) {
      var wiki = Utils.safeJSON('qb_wiki') || {};
      delete wiki[id];
      Utils.safeSet('qb_wiki', JSON.stringify(wiki));
      LegacyState.notify();
    },

    isSavedToWiki: function (id) {
      var wiki = Utils.safeJSON('qb_wiki') || {};
      return !!wiki[id];
    },

    getWiki: function () {
      return Utils.safeJSON('qb_wiki') || {};
    },

    // ── Theme (removed dark mode — always brutalist) ─────────────────────
    applyTheme: function () {
      document.documentElement.setAttribute('data-theme', 'brutalist');
    },
    setTheme: function () { /* no-op — single theme */ },
    initThemeToggle: function () { /* no-op — removed */ }
  };

  // Apply theme on load
  LegacyState.applyTheme();

  // ── Expose globally ────────────────────────────────────────────────────
  window.state = LegacyState;

})();
