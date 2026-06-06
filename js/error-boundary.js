/**
 * error-boundary.js — Safety net + dev visibility.
 *
 * Two modes:
 *   1. PRODUCTION (default): Silent for minor errors. Shows crash screen
 *      only on 3+ catastrophic errors AND no visible content.
 *   2. DEBUG (URL has ?debug=1):  Every JS error is shown as a small red
 *      toast in the bottom-right so you can spot issues quickly.
 */
(function() {
  var errorCount = 0;
  var DEBUG = /[?&]debug=1\b/.test(location.search);

  window.addEventListener('error', function(event) {
    errorCount++;
    console.error('JS error:', event.message, '@', event.filename, ':', event.lineno);
    if (DEBUG) showToast('Error: ' + (event.message || 'unknown') + '  (' +
                         (event.filename || '?').split('/').pop() + ':' + event.lineno + ')');
    if (errorCount >= 3) showCrashScreen();
  });

  window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled rejection:', event.reason);
    if (DEBUG) showToast('Promise rejection: ' + ((event.reason && event.reason.message) || event.reason));
  });

  // Public API for app code to log non-fatal issues during dev
  window.QV = window.QV || {};
  window.QV.warn = function(msg) {
    console.warn('[QV]', msg);
    if (DEBUG) showToast('Warn: ' + msg, '#cc8800');
  };

  // ── Toast (debug mode only) ────────────────────────────────────────────
  function showToast(msg, color) {
    if (!document.body) return;
    var bar = document.getElementById('qv-debug-toast');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'qv-debug-toast';
      bar.style.cssText =
        'position:fixed;bottom:16px;right:16px;max-width:420px;z-index:99999;' +
        'font-family:monospace;font-size:12px;display:flex;flex-direction:column;gap:6px;';
      document.body.appendChild(bar);
    }
    var line = document.createElement('div');
    line.style.cssText =
      'background:' + (color || '#aa1144') + ';color:#fff;padding:8px 12px;' +
      'border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.35);' +
      'opacity:0;transition:opacity .2s';
    line.textContent = msg;
    bar.appendChild(line);
    requestAnimationFrame(function() { line.style.opacity = '1'; });
    setTimeout(function() {
      line.style.opacity = '0';
      setTimeout(function() { if (line.parentNode) line.parentNode.removeChild(line); }, 250);
    }, 6000);
  }

  // ── Crash screen (only when nothing has rendered) ─────────────────────
  function showCrashScreen() {
    if (document.querySelectorAll('.question-card, .topic-card, .hero-content, quiz-card').length > 0) return;
    if (document.getElementById('error-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--paper,#f5f0e8);color:var(--ink,#0a0a0a);' +
      'z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'font-family:"Courier New",monospace;text-align:center;padding:40px;';
    overlay.innerHTML =
      '<div style="font-size:11px;font-weight:700;letter-spacing:4px;margin-bottom:16px;color:#888">SYSTEM_FAULT</div>' +
      '<h1 style="font-size:48px;font-weight:900;margin-bottom:8px;letter-spacing:-2px">LOAD_ERROR</h1>' +
      '<div style="width:80px;border-top:6px solid var(--hot,#fa1e4e);margin:16px auto"></div>' +
      '<p style="font-size:13px;max-width:440px;margin-bottom:32px;letter-spacing:1px;line-height:1.6">' +
      'CRITICAL: QUESTION_DATA_FAILED_TO_LOAD.<br>CLEAR CACHE AND RELOAD.</p>' +
      '<button id="qv-reload-btn" style="background:var(--hot,#fa1e4e);color:var(--paper,#f5f0e8);border:3px solid var(--ink,#0a0a0a);padding:12px 32px;font-weight:900;font-family:inherit;font-size:13px;letter-spacing:2px;cursor:pointer;box-shadow:4px 4px 0 var(--ink,#0a0a0a)">RELOAD ↺</button>';
    document.body.appendChild(overlay);
    var btn = document.getElementById('qv-reload-btn');
    if (btn) btn.addEventListener('click', function() { location.reload(); });
  }
})();
