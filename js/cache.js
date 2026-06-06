/**
 * cache.js — IndexedDB Question Cache Layer (Item 4)
 *
 * Stores fetched question batches in IndexedDB for offline access.
 * Falls back gracefully if IndexedDB is unavailable (private browsing, etc.).
 *
 * API:
 *   QVCache.put(key, data)    — store data
 *   QVCache.get(key)          — retrieve data (returns Promise)
 *   QVCache.clear()           — wipe cache
 *   QVCache.isAvailable()     — check if IndexedDB works
 */

(function () {
  'use strict';

  var DB_NAME = 'QuizVaultCache';
  var DB_VERSION = 1;
  var STORE_NAME = 'questions';
  var _db = null;
  var _available = false;

  /**
   * Open (or create) the IndexedDB database.
   * @returns {Promise<IDBDatabase>}
   */
  function openDB() {
    return new Promise(function (resolve, reject) {
      if (_db) { resolve(_db); return; }

      try {
        var request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
          }
        };

        request.onsuccess = function (e) {
          _db = e.target.result;
          _available = true;
          resolve(_db);
        };

        request.onerror = function (e) {
          console.warn('[cache] IndexedDB open failed:', e.target.error);
          _available = false;
          reject(e.target.error);
        };
      } catch (err) {
        console.warn('[cache] IndexedDB not supported:', err);
        _available = false;
        reject(err);
      }
    });
  }

  /**
   * Store data in the cache.
   * @param {string} key
   * @param {*} data
   * @returns {Promise<void>}
   */
  function put(key, data) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        store.put({
          cacheKey: key,
          data: data,
          timestamp: Date.now()
        });
        tx.oncomplete = resolve;
        tx.onerror = function (e) { reject(e.target.error); };
      });
    }).catch(function (err) {
      console.warn('[cache] Put failed for key "' + key + '":', err);
    });
  }

  /**
   * Retrieve data from the cache.
   * @param {string} key
   * @param {number} [maxAgeMs=86400000] — max age in ms (default 24h)
   * @returns {Promise<*|null>}
   */
  function get(key, maxAgeMs) {
    maxAgeMs = maxAgeMs || 86400000; // 24 hours
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var request = store.get(key);
        request.onsuccess = function () {
          var result = request.result;
          if (!result) { resolve(null); return; }
          // Check staleness
          if (Date.now() - result.timestamp > maxAgeMs) {
            resolve(null); // Too old
            return;
          }
          resolve(result.data);
        };
        request.onerror = function (e) { reject(e.target.error); };
      });
    }).catch(function (err) {
      console.warn('[cache] Get failed for key "' + key + '":', err);
      return null;
    });
  }

  /**
   * Clear all cached data.
   * @returns {Promise<void>}
   */
  function clear() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = resolve;
        tx.onerror = function (e) { reject(e.target.error); };
      });
    }).catch(function (err) {
      console.warn('[cache] Clear failed:', err);
    });
  }

  /**
   * Check if IndexedDB is available.
   * @returns {boolean}
   */
  function isAvailable() {
    return _available;
  }

  // ── Expose globally ───────────────────────────────────────────────────
  window.QVCache = {
    put: put,
    get: get,
    clear: clear,
    isAvailable: isAvailable
  };

  // Pre-warm the connection
  openDB().catch(function () {});

})();
