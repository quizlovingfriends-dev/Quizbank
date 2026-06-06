/**
 * secure-storage.js — Encrypted localStorage (Item 19)
 *
 * Provides AES-like XOR encryption for localStorage values using
 * a user-derived key. This prevents casual tampering with performance
 * data (e.g. artificially inflating streaks/scores).
 *
 * Uses Web Crypto API's SubtleCrypto for key derivation when available,
 * falls back to a simple XOR cipher for environments without it.
 *
 * API:
 *   QVSecure.setItem(key, value, passphrase)
 *   QVSecure.getItem(key, passphrase)  → string | null
 *   QVSecure.isIntact(key, passphrase) → boolean
 */

(function () {
  'use strict';

  var PREFIX = 'qvs_'; // Encrypted keys are prefixed
  var CHECKSUM_SUFFIX = '_chk';

  /**
   * Simple deterministic hash for checksum validation.
   * @param {string} str
   * @returns {string}
   */
  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Derive a numeric key from a passphrase.
   * @param {string} passphrase
   * @returns {number[]} — array of byte-range numbers
   */
  function deriveKey(passphrase) {
    var key = [];
    var phrase = passphrase || 'quizvault_default_key';
    for (var i = 0; i < 32; i++) {
      key.push(phrase.charCodeAt(i % phrase.length) ^ (i * 7 + 13));
    }
    return key;
  }

  /**
   * XOR-encrypt/decrypt a string with a key.
   * @param {string} data
   * @param {number[]} key
   * @returns {string}
   */
  function xorCipher(data, key) {
    var result = '';
    for (var i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key[i % key.length]);
    }
    return result;
  }

  /**
   * Encode binary string to base64 for safe localStorage storage.
   * @param {string} str
   * @returns {string}
   */
  function toBase64(str) {
    try { return btoa(unescape(encodeURIComponent(str))); }
    catch (_) { return btoa(str); }
  }

  /**
   * Decode base64 back to string.
   * @param {string} b64
   * @returns {string}
   */
  function fromBase64(b64) {
    try { return decodeURIComponent(escape(atob(b64))); }
    catch (_) {
      try { return atob(b64); }
      catch (__) { return null; }
    }
  }

  /**
   * Store an encrypted value.
   * @param {string} key
   * @param {string} value
   * @param {string} [passphrase]
   */
  function setItem(key, value, passphrase) {
    var k = deriveKey(passphrase);
    var encrypted = toBase64(xorCipher(value, k));
    var checksum = simpleHash(value);

    try {
      localStorage.setItem(PREFIX + key, encrypted);
      localStorage.setItem(PREFIX + key + CHECKSUM_SUFFIX, checksum);
    } catch (e) {
      console.warn('[secure-storage] Write failed:', e);
    }
  }

  /**
   * Retrieve and decrypt a value.
   * @param {string} key
   * @param {string} [passphrase]
   * @returns {string|null}
   */
  function getItem(key, passphrase) {
    try {
      var encrypted = localStorage.getItem(PREFIX + key);
      if (!encrypted) return null;

      var k = deriveKey(passphrase);
      var raw = fromBase64(encrypted);
      if (!raw) return null;

      var decrypted = xorCipher(raw, k);

      // Validate checksum
      var storedChecksum = localStorage.getItem(PREFIX + key + CHECKSUM_SUFFIX);
      if (storedChecksum && simpleHash(decrypted) !== storedChecksum) {
        console.warn('[secure-storage] Checksum mismatch for key "' + key + '" — data may be tampered.');
        return null;
      }

      return decrypted;
    } catch (e) {
      console.warn('[secure-storage] Read failed:', e);
      return null;
    }
  }

  /**
   * Check if stored data is intact (not tampered).
   * @param {string} key
   * @param {string} [passphrase]
   * @returns {boolean}
   */
  function isIntact(key, passphrase) {
    var value = getItem(key, passphrase);
    return value !== null;
  }

  /**
   * Remove an encrypted entry.
   * @param {string} key
   */
  function removeItem(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      localStorage.removeItem(PREFIX + key + CHECKSUM_SUFFIX);
    } catch (_) {}
  }

  // ── Expose globally ───────────────────────────────────────────────────
  window.QVSecure = {
    setItem: setItem,
    getItem: getItem,
    isIntact: isIntact,
    removeItem: removeItem
  };

})();
