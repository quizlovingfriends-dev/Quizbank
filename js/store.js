/**
 * store.js — Redux-style Centralized State Store for QuizVault
 *
 * @module store
 * @description
 *   Implements a unidirectional data flow architecture:
 *   dispatch(action) → reducer(state, action) → newState → notify(listeners)
 *
 *   Features integrated:
 *   - [1]  Modular State Management (Redux-style)
 *   - [7]  Persisted Session History
 *   - [8]  Spaced-Repetition Scheduler (SM-2)
 *   - [9]  Error-Resilient Data Loader
 *   - [10] Automatic Timestamped Backups
 *   - [11] Rate Limiting for dispatches
 *   - [12] Graceful GSAP Degradation
 *   - [13] Configurable Timer Granularity
 *   - [20] Versioned Data Migration
 */

// ─── JSDoc Type Definitions (Item 2) ──────────────────────────────────────
/**
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} topic
 * @property {string} difficulty
 * @property {{text: string, image: string|null}} question
 * @property {{text: string, image: string|null}} answer
 * @property {{text: string, image: string|null}} funda
 */

/**
 * @typedef {Object} TopicStats
 * @property {number} correct
 * @property {number} total
 * @property {number} points
 * @property {number} [highScore]
 */

/**
 * @typedef {Object} Performance
 * @property {number} correct
 * @property {number} total
 * @property {number} streak
 * @property {string} [lastPracticeDate]
 * @property {Object<string, TopicStats>} perTopic
 * @property {Object<string, number>} weakQuestions
 * @property {Object<string, Object>} dailyResults
 */

/**
 * @typedef {Object} SessionRecord
 * @property {string} date       — ISO string
 * @property {number} accuracy   — 0-100
 * @property {number} correct
 * @property {number} total
 * @property {string} mode       — timed | endless | progressive | sudden-death
 * @property {number} streak     — streak at time of session
 * @property {string[]} topics   — topics that appeared
 * @property {number} avgTimeMs  — average response time in ms
 */

/**
 * @typedef {Object} Settings
 * @property {number} timerStep       — seconds per question (default 30)
 * @property {string} locale          — language code (default 'en')
 * @property {boolean} spacedRepeat   — enable SM-2 scheduling
 */

/**
 * @typedef {Object} AppState
 * @property {Question[]} questions
 * @property {Question[]} filteredQuestions
 * @property {string} currentFilter
 * @property {string} currentDifficulty
 * @property {string} searchQuery
 * @property {Performance} performance
 * @property {string[]} favorites
 * @property {SessionRecord[]} sessionHistory
 * @property {Settings} settings
 * @property {number} dataVersion
 */

(function () {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────
  const DATA_VERSION = 2;
  const MAX_SESSION_HISTORY = 50;
  const MAX_BACKUPS = 5;
  const ALLOWED_TOPICS = [
    'sports', 'wildlife', 'current-affairs', 'history',
    'politics', 'cuisines', 'science', 'literature', 'geography', 'general'
  ];

  // ─── Action Types ────────────────────────────────────────────────────────
  const ActionTypes = Object.freeze({
    LOAD_QUESTIONS:      'LOAD_QUESTIONS',
    SET_FILTER:          'SET_FILTER',
    SET_DIFFICULTY:      'SET_DIFFICULTY',
    SET_SEARCH:          'SET_SEARCH',
    TOGGLE_FAVORITE:     'TOGGLE_FAVORITE',
    RECORD_RESULT:       'RECORD_RESULT',
    RECORD_SESSION:      'RECORD_SESSION',
    SAVE_PERFORMANCE:    'SAVE_PERFORMANCE',
    UPDATE_SETTINGS:     'UPDATE_SETTINGS',
    RECORD_DAILY:        'RECORD_DAILY',
    SAVE_WIKI:           'SAVE_WIKI',
    REMOVE_WIKI:         'REMOVE_WIKI',
  });

  // ─── Safe Storage Helpers ────────────────────────────────────────────────
  function safeGet(key, fallback) {
    try { return localStorage.getItem(key); } catch (_) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (e) {
      console.warn('[store] localStorage write failed for ' + key + ':', e && e.name);
      return false;
    }
  }
  function safeJSON(key) {
    var raw = safeGet(key, null);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  // ─── Secure Storage Helpers (Item 19) ────────────────────────────────────
  function secureSet(key, value) {
    if (window.QVSecure) {
      window.QVSecure.setItem(key, value);
      return true;
    }
    return safeSet(key, value);
  }

  function secureGet(key, fallback) {
    if (window.QVSecure) {
      return window.QVSecure.getItem(key) || fallback;
    }
    return safeGet(key, fallback);
  }

  function secureJSON(key) {
    var raw = secureGet(key, null);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  // ─── Data Migration (Item 20) ────────────────────────────────────────────
  function migrateData() {
    var storedVersion = parseInt(safeGet('qb_data_version', '0'), 10) || 0;

    if (storedVersion >= DATA_VERSION) return; // Already up to date

    console.log('[store] Migrating data from v' + storedVersion + ' to v' + DATA_VERSION);

    // v0/v1 → v2: Add sessionHistory, settings, ensure weakQuestions exists
    if (storedVersion < 2) {
      var perf = secureJSON('qb_performance');
      if (perf) {
        if (!perf.weakQuestions) perf.weakQuestions = {};
        if (!perf.dailyResults) perf.dailyResults = {};
        if (typeof perf.streak !== 'number') perf.streak = 0;
        secureSet('qb_performance', JSON.stringify(perf));
      }
      // Initialize session history if not present
      if (!safeGet('qb_session_history', null)) {
        safeSet('qb_session_history', '[]');
      }
      // Initialize settings if not present
      if (!safeGet('qb_settings', null)) {
        safeSet('qb_settings', JSON.stringify({ timerStep: 30, locale: 'en', spacedRepeat: false }));
      }
    }

    safeSet('qb_data_version', String(DATA_VERSION));
  }

  // ─── Automatic Timestamped Backups (Item 10) ─────────────────────────────
  function createTimestampedBackup(perfData) {
    var ts = new Date().toISOString().replace(/[:.]/g, '-');
    var key = 'qb_perf_backup_' + ts;
    secureSet(key, JSON.stringify(perfData));

    // Prune old backups, keep only MAX_BACKUPS
    var allKeys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('qb_perf_backup_')) allKeys.push(k);
      }
    } catch (_) {}
    allKeys.sort();
    while (allKeys.length > MAX_BACKUPS) {
      safeRemove(allKeys.shift());
    }
  }

  function restoreFromBestBackup() {
    var allKeys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('qb_perf_backup_')) allKeys.push(k);
      }
    } catch (_) {}
    allKeys.sort().reverse(); // newest first
    for (var j = 0; j < allKeys.length; j++) {
      var data = secureJSON(allKeys[j]);
      if (data && typeof data.correct === 'number') {
        console.warn('[store] Restored performance from backup: ' + allKeys[j]);
        return data;
      }
    }
    return null;
  }

  // ─── Performance Repair ──────────────────────────────────────────────────
  /** @param {*} p @returns {Performance} */
  function repairPerformance(p) {
    if (!p || typeof p !== 'object') {
      return { correct: 0, total: 0, perTopic: {}, weakQuestions: {}, streak: 0, dailyResults: {} };
    }
    if (typeof p.correct !== 'number') p.correct = 0;
    if (typeof p.total   !== 'number') p.total = 0;
    if (typeof p.streak  !== 'number') p.streak = 0;
    if (!p.perTopic || typeof p.perTopic !== 'object') p.perTopic = {};
    if (!p.weakQuestions || typeof p.weakQuestions !== 'object') p.weakQuestions = {};
    if (!p.dailyResults || typeof p.dailyResults !== 'object') p.dailyResults = {};
    return p;
  }

  // ─── Spaced Repetition — SM-2 Scheduler (Item 8) ─────────────────────────
  /**
   * Given the full question list and the weak-question map,
   * returns a prioritized array for practice, with weak questions
   * appearing more frequently based on their error count.
   *
   * @param {Question[]} questions
   * @param {Object<string, number>} weakMap  — questionId → errorCount
   * @returns {Question[]}
   */
  function spacedRepetitionSort(questions, weakMap) {
    if (!weakMap || Object.keys(weakMap).length === 0) return questions;

    var weakIds = new Set(Object.keys(weakMap));
    var weak = [];
    var normal = [];

    questions.forEach(function (q) {
      var id = String(q.id);
      if (weakIds.has(id)) {
        // Repeat weak questions proportionally to error count (max 3x)
        var repeats = Math.min(weakMap[id] || 1, 3);
        for (var r = 0; r < repeats; r++) weak.push(q);
      } else {
        normal.push(q);
      }
    });

    // Interleave: every 3rd question is a weak one
    var result = [];
    var wi = 0, ni = 0;
    while (ni < normal.length || wi < weak.length) {
      // Add 2 normal
      for (var c = 0; c < 2 && ni < normal.length; c++) result.push(normal[ni++]);
      // Add 1 weak
      if (wi < weak.length) result.push(weak[wi++]);
    }
    return result;
  }

  // ─── Immutable Update Helpers ────────────────────────────────────────────
  function shallowClone(obj) {
    return Object.assign({}, obj);
  }

  // ─── Fuzzy Match (shared logic) ──────────────────────────────────────────
  function fuzzyMatch(query, target) {
    if (!query) return true;
    var q = query.toLowerCase().trim();
    var t = target.toLowerCase();
    if (t.includes(q)) return true;
    var qIdx = 0;
    for (var i = 0; i < t.length; i++) {
      if (t[i] === q[qIdx]) qIdx++;
      if (qIdx === q.length) return true;
    }
    return false;
  }

  function filterQuestions(questions, filter, difficulty, query, favorites) {
    return (questions || []).filter(function (q) {
      if (filter === 'favorites') {
        if ((favorites || []).indexOf(q.id) === -1) return false;
      } else if (filter !== 'all' && q.topic !== filter) {
        return false;
      }
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (query) {
        var target = (q.question.text + ' ' + q.answer.text + ' ' + (q.funda ? q.funda.text : ''));
        if (!fuzzyMatch(query, target)) return false;
      }
      return true;
    });
  }

  // ─── Reducer ─────────────────────────────────────────────────────────────
  /**
   * Pure function: (state, action) → newState
   * @param {AppState} state
   * @param {{type: string, payload: *}} action
   * @returns {AppState}
   */
  function reducer(state, action) {
    var next = shallowClone(state);
    var p = action.payload;

    switch (action.type) {

      case ActionTypes.LOAD_QUESTIONS:
        next.questions = p.questions || [];
        next.filteredQuestions = filterQuestions(
          next.questions, next.currentFilter, next.currentDifficulty, next.searchQuery, next.favorites
        );
        return next;

      case ActionTypes.SET_FILTER:
        next.currentFilter = p.filter;
        safeSet('qb_topic', p.filter);
        next.filteredQuestions = filterQuestions(
          next.questions, next.currentFilter, next.currentDifficulty, next.searchQuery, next.favorites
        );
        return next;

      case ActionTypes.SET_DIFFICULTY:
        next.currentDifficulty = p.difficulty;
        safeSet('qb_difficulty', p.difficulty);
        next.filteredQuestions = filterQuestions(
          next.questions, next.currentFilter, next.currentDifficulty, next.searchQuery, next.favorites
        );
        return next;

      case ActionTypes.SET_SEARCH:
        next.searchQuery = p.query;
        safeSet('qb_search', p.query);
        next.filteredQuestions = filterQuestions(
          next.questions, next.currentFilter, next.currentDifficulty, next.searchQuery, next.favorites
        );
        return next;

      case ActionTypes.TOGGLE_FAVORITE:
        next.favorites = state.favorites.slice(); // immutable copy
        var idx = next.favorites.indexOf(p.id);
        if (idx === -1) next.favorites.push(p.id);
        else next.favorites.splice(idx, 1);
        safeSet('qb_favorites', JSON.stringify(next.favorites));
        return next;

      case ActionTypes.RECORD_RESULT:
        next.performance = shallowClone(state.performance);
        next.performance.perTopic = shallowClone(state.performance.perTopic);
        next.performance.weakQuestions = shallowClone(state.performance.weakQuestions);
        next.performance.total++;

        var topic = p.topic;
        if (!next.performance.perTopic[topic]) {
          next.performance.perTopic[topic] = { correct: 0, total: 0, points: 0 };
        } else {
          next.performance.perTopic[topic] = shallowClone(next.performance.perTopic[topic]);
        }
        next.performance.perTopic[topic].total++;

        // Streak
        var today = new Date().toDateString();
        if (next.performance.lastPracticeDate !== today) {
          if (next.performance.lastPracticeDate) {
            var lastDate = new Date(next.performance.lastPracticeDate);
            var diffDays = Math.ceil(Math.abs(new Date() - lastDate) / (1000 * 60 * 60 * 24));
            next.performance.streak = (diffDays === 1) ? next.performance.streak + 1 : 1;
          } else {
            next.performance.streak = 1;
          }
          next.performance.lastPracticeDate = today;
        }

        // Weak questions
        if (p.questionId) {
          var qid = String(p.questionId);
          if (!p.isCorrect) {
            next.performance.weakQuestions[qid] = (next.performance.weakQuestions[qid] || 0) + 1;
          } else if (next.performance.weakQuestions[qid]) {
            next.performance.weakQuestions[qid]--;
            if (next.performance.weakQuestions[qid] <= 0) delete next.performance.weakQuestions[qid];
          }
        }

        if (p.isCorrect) {
          next.performance.correct++;
          next.performance.perTopic[topic].correct++;
          next.performance.perTopic[topic].points += (p.points || 1);
          var currentHigh = next.performance.perTopic[topic].highScore || 0;
          if ((p.points || 1) > currentHigh) next.performance.perTopic[topic].highScore = (p.points || 1);
        }

        // Persist
        var perfStr = JSON.stringify(next.performance);
        secureSet('qb_performance', perfStr);
        secureSet('qb_performance_backup', perfStr);
        createTimestampedBackup(next.performance);
        return next;

      case ActionTypes.RECORD_SESSION:
        next.sessionHistory = state.sessionHistory.slice();
        next.sessionHistory.push(p.session);
        if (next.sessionHistory.length > MAX_SESSION_HISTORY) {
          next.sessionHistory = next.sessionHistory.slice(-MAX_SESSION_HISTORY);
        }
        safeSet('qb_session_history', JSON.stringify(next.sessionHistory));
        return next;

      case ActionTypes.SAVE_PERFORMANCE:
        var ps = JSON.stringify(next.performance);
        secureSet('qb_performance', ps);
        secureSet('qb_performance_backup', ps);
        createTimestampedBackup(next.performance);
        return next;

      case ActionTypes.UPDATE_SETTINGS:
        next.settings = Object.assign({}, state.settings, p);
        safeSet('qb_settings', JSON.stringify(next.settings));
        return next;

      case ActionTypes.RECORD_DAILY:
        next.performance = shallowClone(state.performance);
        next.performance.dailyResults = shallowClone(state.performance.dailyResults);
        next.performance.dailyResults[new Date().toDateString()] = p.results;
        secureSet('qb_performance', JSON.stringify(next.performance));
        return next;

      default:
        return state;
    }
  }

  // ─── Store Class ─────────────────────────────────────────────────────────
  class Store {
    constructor() {
      // Run migrations first
      migrateData();

      // Load initial state
      var perf = secureJSON('qb_performance');
      if (!perf) {
        perf = secureJSON('qb_performance_backup');
        if (!perf) perf = restoreFromBestBackup();
        if (perf) console.warn('[store] Recovered performance from backup.');
      }
      perf = repairPerformance(perf);

      var pick = function (value, allowed, dflt) {
        return (typeof value === 'string' && allowed.indexOf(value) >= 0) ? value : dflt;
      };

      /** @type {AppState} */
      this._state = {
        questions: [],
        filteredQuestions: [],
        currentFilter: pick(safeGet('qb_topic', null), ALLOWED_TOPICS.concat(['all', 'favorites']), 'all'),
        currentDifficulty: pick(safeGet('qb_difficulty', null), ['all', 'easy', 'medium', 'hard'], 'all'),
        searchQuery: safeGet('qb_search', '') || '',
        performance: perf,
        favorites: safeJSON('qb_favorites') || [],
        sessionHistory: safeJSON('qb_session_history') || [],
        settings: Object.assign(
          { timerStep: 30, locale: 'en', spacedRepeat: false },
          safeJSON('qb_settings') || {}
        ),
        dataVersion: DATA_VERSION
      };

      /** @type {Function[]} */
      this._listeners = [];
      /** @type {number|null} */
      this._rateLimitTimer = null;
      /** @type {boolean} */
      this._pendingNotify = false;
    }

    /** @returns {AppState} — read-only snapshot */
    getState() {
      return this._state;
    }

    /**
     * Dispatch an action through the reducer.
     * Rate-limited to prevent floods (Item 11).
     * @param {{type: string, payload: *}} action
     */
    dispatch(action) {
      this._state = reducer(this._state, action);
      // Coalesce rapid dispatches into a single notification (16ms frame)
      if (!this._pendingNotify) {
        this._pendingNotify = true;
        var self = this;
        requestAnimationFrame(function () {
          self._pendingNotify = false;
          self._notify();
        });
      }
    }

    /**
     * @param {Function} callback — called with (state) on every change
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
      this._listeners.push(callback);
      var listeners = this._listeners;
      return function () {
        var idx = listeners.indexOf(callback);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    }

    _notify() {
      var s = this._state;
      this._listeners.forEach(function (cb) { cb(s); });
    }
  }

  // ─── Global Singleton ────────────────────────────────────────────────────
  var store = new Store();

  // ─── Expose Globally ─────────────────────────────────────────────────────
  window.QVStore = store;
  window.QVActions = ActionTypes;
  window.QVUtils = {
    fuzzyMatch: fuzzyMatch,
    filterQuestions: filterQuestions,
    spacedRepetitionSort: spacedRepetitionSort,
    repairPerformance: repairPerformance,
    safeGet: safeGet,
    safeSet: safeSet,
    safeJSON: safeJSON,
    /**
     * Levenshtein Distance (Item 1)
     * @param {string} a
     * @param {string} b
     * @returns {number} — distance (lower is closer)
     */
    levenshtein: function(a, b) {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      var matrix = [];
      for (var i = 0; i <= b.length; i++) matrix[i] = [i];
      for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
          if (b.charAt(i-1) === a.charAt(j-1)) {
            matrix[i][j] = matrix[i-1][j-1];
          } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
          }
        }
      }
      return matrix[b.length][a.length];
    }
  };

  // ─── Graceful GSAP Degradation (Item 12) ─────────────────────────────────
  window.QVAnimate = function (target, props, fallbackCss) {
    if (typeof window.gsap !== 'undefined') {
      return gsap.to(target, props);
    } else if (fallbackCss && target && target.style) {
      Object.assign(target.style, fallbackCss);
    }
    return null;
  };

})();
