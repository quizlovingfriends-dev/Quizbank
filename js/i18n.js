/**
 * i18n.js — Internationalization Framework (Item 17)
 *
 * Loads locale JSON files and exposes a simple `t('key')` function.
 * Falls back to the key itself if a translation is missing.
 *
 * Usage:
 *   window.t('btn_submit')  → "SUBMIT ↵"
 *   window.t('missing_key') → "missing_key"
 */

(function () {
  'use strict';

  var _locale = 'en';
  var _strings = {};
  var _loaded = false;

  /**
   * Load a locale file asynchronously.
   * @param {string} locale — e.g. 'en', 'es'
   * @returns {Promise<void>}
   */
  function loadLocale(locale) {
    _locale = locale || 'en';
    return fetch('locales/' + _locale + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Locale file not found: ' + _locale);
        return res.json();
      })
      .then(function (data) {
        _strings = data;
        _loaded = true;
        console.log('[i18n] Loaded locale: ' + _locale + ' (' + Object.keys(data).length + ' strings)');
      })
      .catch(function (err) {
        console.warn('[i18n] Failed to load locale "' + _locale + '", using key fallback.', err);
        _strings = {};
        _loaded = true;
      });
  }

  /**
   * Translate a key.
   * @param {string} key
   * @param {Object} [vars] — optional interpolation: t('hello', { name: 'World' })
   * @returns {string}
   */
  function t(key, vars) {
    var str = _strings[key] || key;
    if (vars && typeof vars === 'object') {
      Object.keys(vars).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  /**
   * Get current locale code.
   * @returns {string}
   */
  function getLocale() {
    return _locale;
  }

  /**
   * Check if translations are loaded.
   * @returns {boolean}
   */
  function isLoaded() {
    return _loaded;
  }

  // ── Auto-load on script inclusion ─────────────────────────────────────
  var settings;
  try {
    settings = JSON.parse(localStorage.getItem('qb_settings') || '{}');
  } catch (_) {
    settings = {};
  }
  loadLocale(settings.locale || 'en');

  // ── Expose globally ───────────────────────────────────────────────────
  window.t = t;
  window.QVi18n = {
    loadLocale: loadLocale,
    t: t,
    getLocale: getLocale,
    isLoaded: isLoaded
  };

})();
