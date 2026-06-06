/**
 * admin-review.js — UI for the pending-question review queue.
 *
 * Reads data/pending_questions.json. Renders one card per item.
 * Lets you edit Q/A/funda/topic in-place, then approve or reject.
 *
 * Approve = save to a "pending_approved.json" file that the Python
 * `apply_approvals.py` script picks up and merges into questions.js.
 * Reject = save to "pending_rejected.json" for audit trail.
 *
 * Because Netlify serves a static site, this UI CAN'T directly edit
 * server files. Instead, your decisions are buffered to localStorage
 * and exported as a JSON file you run through `apply_approvals.py`.
 *
 * Designed for local-first workflow:
 *   1. Drop quiz files → watcher → pending_questions.json
 *   2. Open admin-review.html locally (file:// or localhost) → review
 *   3. Click "EXPORT_DECISIONS" → downloads approvals.json
 *   4. Run `python scripts/apply_approvals.py approvals.json`
 *   5. git add . && git commit && git push → live in 60s
 */
(function() {
  const REVIEW_LIST  = document.getElementById('review-list');
  const EMPTY_STATE  = document.getElementById('empty-state');
  const BULK_BAR     = document.getElementById('bulk-bar');
  const QUEUE_COUNT  = document.getElementById('queue-count');
  const RELOAD_BTN   = document.getElementById('reload-btn');
  const EXPORT_BTN   = document.getElementById('export-btn');

  const ALLOWED_TOPICS = [
    'sports', 'wildlife', 'current-affairs', 'history', 'politics',
    'cuisines', 'science', 'literature', 'geography', 'general',
  ];

  // Decision buffer: indexes → { decision: 'approve' | 'reject', edits: {...} }
  const decisions = {};

  // ─── Load queue ─────────────────────────────────────────────────────────
  async function loadQueue() {
    try {
      const res = await fetch('data/pending_questions.json?ts=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const queue = await res.json();
      render(queue.items || []);
    } catch (e) {
      render([]);
      console.warn('[admin-review] No pending_questions.json found yet:', e.message);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  function render(items) {
    REVIEW_LIST.innerHTML = '';

    if (items.length === 0) {
      EMPTY_STATE.style.display = '';
      BULK_BAR.style.display = 'none';
      return;
    }

    EMPTY_STATE.style.display = 'none';
    BULK_BAR.style.display = '';
    QUEUE_COUNT.textContent = items.length + ' PENDING';

    items.forEach((item, idx) => {
      REVIEW_LIST.appendChild(buildCard(item, idx));
    });
  }

  function buildCard(item, idx) {
    const q  = item.question || {};
    const g  = item.gate || {};

    // Flat-shape questions from the extractor; normalise
    const qText  = q.question_text  || (q.question && q.question.text)  || '';
    const aText  = q.answer_text    || (q.answer   && q.answer.text)    || '';
    const fText  = q.funda_text     || (q.funda    && q.funda.text)     || '';
    const topic  = q.topic || 'general';

    const wrap = document.createElement('div');
    wrap.className = 'review-item';
    wrap.dataset.idx = idx;

    wrap.innerHTML = `
      <div>
        <span class="score-pill">SCORE: ${g.score || 0}/100</span>
        <span class="topic-pill" data-topic-pill>${topic.toUpperCase()}</span>
        <span style="float:right;font-size:10px;color:var(--grey);letter-spacing:1px;">
          ${item.source || 'unknown'} // ${item.submitted_at || ''}
        </span>
      </div>

      <div class="issues">
        ⚠ ${(g.issues || []).join(' · ') || 'No issues detected.'}
      </div>

      <div class="field-label">QUESTION_TEXT</div>
      <textarea data-field="question_text">${escapeHTML(qText)}</textarea>

      <div class="field-label">ANSWER_TEXT</div>
      <textarea data-field="answer_text">${escapeHTML(aText)}</textarea>

      <div class="field-label">FUNDA_TEXT</div>
      <textarea data-field="funda_text">${escapeHTML(fText)}</textarea>

      <div class="field-label">TOPIC</div>
      <select data-field="topic">
        ${ALLOWED_TOPICS.map(t =>
          `<option value="${t}"${t===topic?' selected':''}>${t.toUpperCase()}</option>`
        ).join('')}
      </select>

      <div class="review-actions">
        <button class="btn btn-reject"  data-action="reject">DISCARD</button>
        <button class="btn btn-approve" data-action="approve" style="margin-left:auto;">APPROVE →</button>
      </div>
    `;

    // Wire buttons
    wrap.querySelector('[data-action="approve"]').addEventListener('click', () => {
      markDecision(idx, 'approve', collectEdits(wrap));
      wrap.style.opacity = '0.35';
      wrap.style.pointerEvents = 'none';
      flashBorder(wrap, '#0d8c3a');
    });
    wrap.querySelector('[data-action="reject"]').addEventListener('click', () => {
      markDecision(idx, 'reject', collectEdits(wrap));
      wrap.style.opacity = '0.35';
      wrap.style.pointerEvents = 'none';
      flashBorder(wrap, '#ff3300');
    });

    return wrap;
  }

  function collectEdits(wrap) {
    const edits = {};
    wrap.querySelectorAll('[data-field]').forEach(el => {
      edits[el.dataset.field] = el.value;
    });
    return edits;
  }

  function markDecision(idx, decision, edits) {
    decisions[idx] = { decision, edits };
    saveDecisions();
    // Refresh top bar to show how many decisions are buffered
    const total = Object.keys(decisions).length;
    EXPORT_BTN.textContent = 'EXPORT_DECISIONS (' + total + ')';
    EXPORT_BTN.style.background = total > 0 ? 'var(--hot)' : '';
    EXPORT_BTN.style.color      = total > 0 ? 'var(--paper)' : '';
  }

  function saveDecisions() {
    try { localStorage.setItem('qv_admin_decisions', JSON.stringify(decisions)); } catch(_) {}
  }

  // ─── Export ─────────────────────────────────────────────────────────────
  function exportDecisions() {
    const payload = {
      exported_at: new Date().toISOString(),
      decisions:   decisions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'approvals_' + Date.now() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    alert('Saved approvals JSON.\n\nNext: run\n  python quiz-automator/scripts/apply_approvals.py <file>');
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function flashBorder(el, color) {
    const orig = el.style.borderColor;
    el.style.borderColor = color;
    setTimeout(() => { el.style.borderColor = orig; }, 400);
  }

  // ─── Wire top bar ───────────────────────────────────────────────────────
  RELOAD_BTN.addEventListener('click', loadQueue);
  EXPORT_BTN.addEventListener('click', exportDecisions);

  // Restore buffered decisions
  try {
    const saved = JSON.parse(localStorage.getItem('qv_admin_decisions') || '{}');
    Object.assign(decisions, saved);
    if (Object.keys(decisions).length) {
      EXPORT_BTN.textContent = 'EXPORT_DECISIONS (' + Object.keys(decisions).length + ')';
      EXPORT_BTN.style.background = 'var(--hot)';
      EXPORT_BTN.style.color = 'var(--paper)';
    }
  } catch(_) {}

  loadQueue();
})();
