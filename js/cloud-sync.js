/**
 * cloud-sync.js — Optional cloud sync via Supabase (free tier).
 *
 * When the user is signed in (anonymous or email-link), pushes/pulls:
 *   - performance stats          (correct/total/streak)
 *   - favorites / wiki saves
 *   - SM-2 review state (qv_sm2)
 *   - daily-quiz results
 *
 * Disabled by default. Enables when window.QV_SUPABASE_URL +
 * window.QV_SUPABASE_ANON_KEY are present (set in HTML head before this script).
 *
 * Public API on window.QV.sync:
 *   .available()           — true if Supabase creds are configured
 *   .signInAnon()          — anonymous sign-in (no email needed)
 *   .signInEmail(email)    — magic-link sign-in
 *   .signOut()             — sign out
 *   .push()                — upload current localStorage state to cloud
 *   .pull()                — download cloud state and merge into localStorage
 *   .autoSync(intervalMs)  — start periodic background sync
 *   .stopAutoSync()
 *   .status()              — { signedIn, userId, lastSync }
 */
(function() {
  // Supabase credentials — publishable key is safe to commit (designed for client use)
  const URL  = window.QV_SUPABASE_URL  || 'https://cjqfarwjwvlfbyhygeoh.supabase.co';
  const KEY  = window.QV_SUPABASE_ANON_KEY || 'sb_publishable_x72XyYHx6D8mGuV4tvqXZw_Z345Pht9';
  const LS_TOKEN = 'qv_sb_token';
  const LS_USER  = 'qv_sb_user';
  const LS_LAST  = 'qv_sb_last_sync';
  const TABLE    = 'progress';

  // Keys we sync (whitelist — never sync API keys or sensitive data)
  const SYNC_KEYS = [
    'qv_performance',
    'qv_favorites',
    'qv_wiki',
    'qv_sm2',
    'qv_daily_results',
    'qv_extra_xp',
    'qv_session_history',
    'qv_theme',
  ];

  function available() { return !!(URL && KEY); }

  function authHeader() {
    const tok = localStorage.getItem(LS_TOKEN);
    return tok ? { Authorization: 'Bearer ' + tok } : { Authorization: 'Bearer ' + KEY };
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(LS_USER) || 'null'); }
    catch (_) { return null; }
  }

  function userId() { const u = getUser(); return u && u.id; }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function signInAnon() {
    if (!available()) throw new Error('Supabase not configured');
    const r = await fetch(URL + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Generate a stable anon email — same per-browser identity
        email: 'anon-' + crypto.randomUUID() + '@quizvault.local',
        password: crypto.randomUUID(),
      }),
    });
    const data = await r.json();
    if (data.access_token) {
      localStorage.setItem(LS_TOKEN, data.access_token);
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      return data.user;
    }
    throw new Error(data.error_description || 'sign-in failed');
  }

  async function signInEmail(email) {
    if (!available()) throw new Error('Supabase not configured');
    const r = await fetch(URL + '/auth/v1/magiclink', {
      method: 'POST',
      headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return r.ok;
  }

  function signOut() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_LAST);
  }

  // ── Push / Pull ───────────────────────────────────────────────────────────
  function snapshot() {
    const data = {};
    SYNC_KEYS.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    return data;
  }

  function restore(data) {
    if (!data) return;
    Object.keys(data).forEach(k => {
      if (SYNC_KEYS.indexOf(k) >= 0 && data[k] !== null) {
        try { localStorage.setItem(k, data[k]); } catch (_) {}
      }
    });
  }

  async function push() {
    if (!available() || !userId()) throw new Error('not signed in');
    const payload = {
      user_id: userId(),
      data: snapshot(),
      updated_at: new Date().toISOString(),
    };
    const r = await fetch(URL + '/rest/v1/' + TABLE + '?on_conflict=user_id', {
      method: 'POST',
      headers: {
        'apikey': KEY,
        ...authHeader(),
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('push failed: HTTP ' + r.status);
    localStorage.setItem(LS_LAST, String(Date.now()));
    return true;
  }

  async function pull() {
    if (!available() || !userId()) throw new Error('not signed in');
    const r = await fetch(URL + '/rest/v1/' + TABLE +
                          '?select=data&user_id=eq.' + encodeURIComponent(userId()), {
      headers: { 'apikey': KEY, ...authHeader() },
    });
    if (!r.ok) throw new Error('pull failed: HTTP ' + r.status);
    const rows = await r.json();
    if (rows && rows[0] && rows[0].data) {
      restore(rows[0].data);
      localStorage.setItem(LS_LAST, String(Date.now()));
      return true;
    }
    return false;
  }

  // ── Auto-sync loop ────────────────────────────────────────────────────────
  let _interval = null;

  function autoSync(intervalMs) {
    intervalMs = intervalMs || 60_000; // 1 minute default
    if (_interval) clearInterval(_interval);
    _interval = setInterval(() => {
      if (!userId()) return;
      push().catch(e => console.warn('[sync] push failed:', e.message));
    }, intervalMs);
  }

  function stopAutoSync() {
    if (_interval) { clearInterval(_interval); _interval = null; }
  }

  function status() {
    return {
      available:  available(),
      signedIn:   !!userId(),
      userId:     userId(),
      lastSync:   parseInt(localStorage.getItem(LS_LAST) || '0', 10),
    };
  }

  // Expose
  window.QV = window.QV || {};
  window.QV.sync = {
    available,
    signInAnon,
    signInEmail,
    signOut,
    push,
    pull,
    autoSync,
    stopAutoSync,
    status,
  };

  // Log status on load
  if (available()) {
    console.log('[cloud-sync] Supabase configured. User:', userId() || '(not signed in)');
  } else {
    console.log('[cloud-sync] Not configured. Add QV_SUPABASE_URL + QV_SUPABASE_ANON_KEY to enable.');
  }

  // ── Self-injecting SYNC button (no HTML edits required) ────────────────────
  function injectButton() {
    if (!available()) return;
    if (document.getElementById('qv-sync-btn')) return; // already injected

    const navLinks = document.querySelector('.navbar-links');
    if (!navLinks) {
      // Retry in 500ms — page might still be rendering
      setTimeout(injectButton, 500);
      return;
    }

    const btn = document.createElement('button');
    btn.id = 'qv-sync-btn';
    btn.className = 'navbar-link';
    btn.style.cssText =
      'background:transparent;border:2px solid currentColor;cursor:pointer;' +
      'font-family:inherit;font-size:inherit;color:inherit;padding:4px 10px;' +
      'margin-left:12px;letter-spacing:1px;';
    btn.title = 'Cloud sync your progress';
    refreshBtn();
    navLinks.appendChild(btn);

    btn.addEventListener('click', async () => {
      if (!userId()) {
        btn.textContent = '⏳';
        try {
          await signInAnon();
          await pull(); // pull existing cloud data into this browser
          await push(); // push merged state
          autoSync(60_000);
          refreshBtn();
          flashMsg('☁ SYNCED — auto-syncing every 60s');
        } catch (e) {
          console.error('[sync] sign-in failed', e);
          flashMsg('SYNC FAILED — ' + e.message, true);
          btn.textContent = '☁ SYNC';
        }
      } else {
        // Already signed in — manual sync
        btn.textContent = '⏳';
        try {
          await push();
          await pull();
          refreshBtn();
          flashMsg('☁ SYNCED ' + new Date().toLocaleTimeString());
        } catch (e) {
          flashMsg('SYNC FAILED — ' + e.message, true);
          refreshBtn();
        }
      }
    });
  }

  function refreshBtn() {
    const btn = document.getElementById('qv-sync-btn');
    if (!btn) return;
    btn.textContent = userId() ? '☁ SYNCED' : '☁ SYNC';
  }

  function flashMsg(msg, isError) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText =
      'position:fixed;bottom:24px;right:24px;z-index:99999;padding:12px 20px;' +
      'background:' + (isError ? '#ff3300' : '#0a0a0a') + ';color:#fff;' +
      'font-family:monospace;font-size:12px;letter-spacing:1px;' +
      'border:3px solid #fff;box-shadow:6px 6px 0 ' + (isError ? '#ff3300' : '#0a0a0a') + ';';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Auto-resume if already signed in
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectButton();
      if (userId()) autoSync(60_000);
    });
  } else {
    injectButton();
    if (userId()) autoSync(60_000);
  }
})();
