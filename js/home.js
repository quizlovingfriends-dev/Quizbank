/**
 * home.js — Home page logic. Minimal version.
 *
 * Targets:
 *   #stats-bar         — populates 4 stat tiles
 *   #hero-practice-btn — START_PRACTICE button (handled by practice.js)
 *   #last-sync-time    — today's date stamp
 */
(function() {
  function init() {
    if (!window.state) return;
    if (state.loadQuestions) state.loadQuestions();
    state.subscribe(render);
    render(state.data);

    // Last-sync timestamp
    const syncEl = document.getElementById('last-sync-time');
    if (syncEl) {
      syncEl.textContent = new Date().toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    }
  }

  function render(data) {
    if (!data) return;
    renderStats(data);
  }

  function renderStats(data) {
    const wrap = document.getElementById('stats-bar');
    if (!wrap) return;

    const total    = (data.questions || []).length;
    const correct  = data.performance ? (data.performance.correct || 0) : 0;
    const totalAns = data.performance ? (data.performance.total   || 0) : 0;
    const accuracy = totalAns > 0 ? Math.round((correct / totalAns) * 100) : 0;
    const streak   = data.performance ? (data.performance.streak  || 0) : 0;

    let answeredToday = 0;
    try {
      const today = new Date().toDateString();
      const parsed = JSON.parse(localStorage.getItem('qv_daily_results') || '{}');
      answeredToday = parsed[today] ? (parsed[today].total || 0) : 0;
    } catch(e) {}

    // Build with placeholder zeros so we can animate the numbers up
    wrap.innerHTML =
      tile('QUESTIONS', 'questions') +
      tile('ACCURACY',  'accuracy')  +
      tile('STREAK',    'streak')    +
      tile('TODAY',     'today');

    // Animate each number from 0 → target
    const anim = window.QV && window.QV.anim;
    const targets = {
      questions: total,
      accuracy:  accuracy,
      streak:    streak,
      today:     answeredToday,
    };
    Object.keys(targets).forEach(key => {
      const el = wrap.querySelector('[data-stat="' + key + '"]');
      if (!el) return;
      // Set start to 0 with proper suffix
      const suffix = key === 'accuracy' ? '%' : '';
      el.textContent = '0' + suffix;
      if (anim && anim.countUp) {
        anim.countUp(el, targets[key], { duration: 1.0 });
      } else {
        el.textContent = targets[key] + suffix;
      }
    });
  }

  function tile(label, key) {
    return ''
      + '<div class="stat-card" style="border:3px solid var(--ink);padding:24px;background:var(--paper);">'
      +   '<div style="font-size:9px;color:var(--grey);letter-spacing:2px">' + label + '</div>'
      +   '<div data-stat="' + key + '" style="font-size:28px;color:var(--hot);margin-top:12px;font-weight:900">0</div>'
      + '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
