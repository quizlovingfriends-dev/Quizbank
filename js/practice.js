/**
 * practice.js - Practice Mode Logic for QuizVault
 * Reconstructed with extreme stability, SM-2 integration, and dynamic DOM injection.
 */

(function() {
  const state = {
    mode: 'timed',
    secondsPerQ: 30,
    selectedTopics: [],
    selectedDifficulty: 'all',
    questionPool: [],
    currentIndex: 0,
    timerInterval: null,
    timeLeft: 0,
    missedQueue: [], // Spaced repetition: {qid, returnAtIndex}
    sessionStats: { correct: 0, wrong: 0, skipped: 0 },
    emojiHistory: [],
    isDaily: false,
    isRevealed: false,
    comboStreak: 0,
    nearMissAttempt: null,
    _questionStartTime: 0
  };

  // Expose startWith API
  window.QV = window.QV || {};
  window.QV.practice = {
    startWith: function(options) {
      // options: { questions, mode, secondsPerQ, isDaily }
      state.questionPool = options.questions || [];
      state.mode = options.mode || 'timed';
      state.secondsPerQ = options.secondsPerQ || 30;
      state.isDaily = !!options.isDaily;
      state.currentIndex = 0;
      state.sessionStats = { correct: 0, wrong: 0, skipped: 0 };
      state.emojiHistory = [];
      state.missedQueue = [];
      state.comboStreak = 0;
      
      ensurePracticeDOM();

      const modal = document.getElementById('practice-modal');
      if (modal) modal.classList.remove('open');
      
      const overlay = document.getElementById('practice-overlay');
      if (overlay) {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scroll
        loadQuestion(0);
        saveSessionDraft();
      }
    }
  };

  // ── DYNAMIC DOM ──────────────────────────────────────────────────────────
  function ensurePracticeDOM() {
    if (document.getElementById('practice-modal')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'practice-ui-dynamic-wrapper';
    wrapper.innerHTML = `
<!-- PRACTICE SETUP MODAL -->
<div id="practice-modal" class="practice-modal" aria-hidden="true">
  <div class="practice-modal-content">
    <div class="practice-modal-header">
      <h2 class="sidebar-label">PRACTICE_SETUP</h2>
      <button class="close-btn" id="close-practice-modal" aria-label="Close">×</button>
    </div>
    <div class="practice-modal-body">
      <div class="setup-section">
        <label class="setup-label">MODE</label>
        <div class="setup-pills" id="mode-pills">
          <button class="setup-pill active" data-mode="timed">TIMED</button>
          <button class="setup-pill" data-mode="endless">ENDLESS</button>
          <button class="setup-pill" data-mode="sudden-death">SUDDEN_DEATH</button>
          <button class="setup-pill" data-mode="progressive">PROGRESSIVE</button>
          <button class="setup-pill" data-mode="review">SM2_REVIEW</button>
        </div>
      </div>
      <div class="setup-section" id="time-per-q-section">
        <label class="setup-label">SECONDS_PER_QUESTION</label>
        <div class="setup-pills" id="time-pills">
          <button class="setup-pill" data-seconds="15">15</button>
          <button class="setup-pill active" data-seconds="30">30</button>
          <button class="setup-pill" data-seconds="60">60</button>
          <button class="setup-pill" data-seconds="120">120</button>
        </div>
      </div>
      <div class="setup-section" id="topic-section">
        <label class="setup-label">TOPICS</label>
        <div id="practice-topic-list" class="setup-pills"></div>
      </div>
      <div class="setup-section" id="diff-section">
        <label class="setup-label">DIFFICULTY</label>
        <div class="setup-pills" id="diff-pills">
          <button class="setup-pill active" data-difficulty="all">ALL</button>
          <button class="setup-pill" data-difficulty="easy">EASY</button>
          <button class="setup-pill" data-difficulty="medium">MEDIUM</button>
          <button class="setup-pill" data-difficulty="hard">HARD</button>
        </div>
      </div>
    </div>
    <div id="practice-mode-error" style="display:none;padding:8px 12px;background:var(--hot);color:var(--paper);font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:8px;"></div>
    <div class="practice-modal-footer" style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn" id="start-practice-btn">START_SESSION ▶</button>
      <button class="btn" id="drill-weak-btn" style="background:var(--hot);color:var(--paper);" title="Practice questions you previously got wrong">DRILL_WEAK_SPOTS ⚡</button>
    </div>
  </div>
</div>

<!-- PRACTICE ACTIVE OVERLAY -->
<div id="practice-overlay" class="practice-overlay" aria-hidden="true">
  <div class="practice-stage">
    <div class="practice-topbar">
      <div class="practice-progress">QUESTION <span id="practice-q-current">1</span> / <span id="practice-q-total">10</span></div>
      <div class="practice-timer" id="practice-timer-container">
        <div class="practice-timer-bar"><div id="practice-timer-fill"></div></div>
        <div id="practice-timer-text" style="font-size: 11px; margin-top: 4px; text-align: right;">00:30</div>
      </div>
      <button class="btn" id="practice-end-btn" style="padding: 4px 12px; font-size: 10px;">END</button>
    </div>

    <div class="practice-card-active">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div class="topic-badge" id="practice-topic-tag" style="margin: 0;">SPORTS</div>
        <div style="display: flex; gap: 8px;">
          <button class="btn" id="practice-wiki-btn" style="padding: 4px 10px; font-size: 10px; box-shadow: none;" title="Save details to Wiki">SAVE_TO_WIKI</button>
          <button class="btn" id="practice-fav-btn" style="padding: 4px 10px; font-size: 10px; box-shadow: none;" title="Bookmark question">FAVORITE</button>
        </div>
      </div>
      <div class="practice-q-text" id="practice-q-text" style="font-size: 20px; margin-bottom: 24px; font-weight: 500;">Loading…</div>
      <div id="practice-q-image"></div>

      <div class="practice-input-row" style="display: flex; gap: 12px; margin-top: 32px;">
        <input type="text" id="practice-answer-input" class="practice-input" placeholder="TYPE_YOUR_ANSWER" autocomplete="off">
        <button class="btn" id="practice-submit-btn">SUBMIT ↵</button>
      </div>

      <div id="practice-feedback" class="practice-feedback hidden"></div>

      <div id="practice-reveal" class="practice-reveal hidden">
        <div class="reveal-section">
          <div class="reveal-label">CORRECT_ANSWER</div>
          <div id="practice-correct-text" class="reveal-text" style="font-weight: 700; font-size: 18px;"></div>
          <div id="practice-correct-image"></div>
        </div>
        <div class="reveal-section">
          <div class="reveal-label">FUNDA</div>
          <div id="practice-funda-text" class="reveal-text"></div>
        </div>
        <div class="reveal-actions" style="display:flex; gap:12px; margin-top:16px; justify-content:flex-end;">
          <button class="btn btn-ghost" id="practice-mark-wrong" style="font-size: 10px; padding: 6px 12px;">I_MISSED_IT</button>
          <button class="btn" id="practice-mark-right" style="font-size: 10px; padding: 6px 12px;">I_GOT_IT_RIGHT</button>
        </div>
      </div>

      <div class="practice-nav hidden" id="practice-next-container">
        <button class="btn" id="practice-next-btn">NEXT_QUESTION →</button>
      </div>
    </div>
  </div>
</div>

<!-- SESSION SUMMARY SCREEN -->
<div id="session-summary" class="practice-overlay" aria-hidden="true" style="display:none;">
  <div class="practice-stage" style="max-width:640px; text-align:center;">
    <div style="font-size:11px;font-weight:900;letter-spacing:4px;margin-bottom:8px;color:var(--grey);">SESSION_COMPLETE</div>
    <div id="summary-accuracy" style="font-size:72px;font-weight:900;line-height:1;margin-bottom:8px;">0%</div>
    <div id="summary-score" style="font-size:16px;font-weight:700;margin-bottom:24px;border-bottom:3px solid var(--ink);padding-bottom:24px;">0 / 0 CORRECT</div>
    <div id="summary-emoji" style="font-size:20px;letter-spacing:4px;margin-bottom:24px;min-height:28px;word-break:break-all;"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:32px;">
      <div style="border:3px solid var(--ink);padding:12px;">
        <div style="font-size:10px;font-weight:700;color:var(--grey);margin-bottom:4px;">CORRECT</div>
        <div id="summary-correct" style="font-size:28px;font-weight:900;">0</div>
      </div>
      <div style="border:3px solid var(--ink);padding:12px;">
        <div style="font-size:10px;font-weight:700;color:var(--grey);margin-bottom:4px;">WRONG</div>
        <div id="summary-wrong" style="font-size:28px;font-weight:900;">0</div>
      </div>
      <div style="border:3px solid var(--ink);padding:12px;">
        <div style="font-size:10px;font-weight:700;color:var(--grey);margin-bottom:4px;">MODE</div>
        <div id="summary-mode" style="font-size:14px;font-weight:900;">TIMED</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn" id="summary-share-btn">COPY_RESULT 📋</button>
      <button class="btn" id="summary-again-btn">PRACTICE_AGAIN ↺</button>
      <button class="btn" id="summary-close-btn">CLOSE ×</button>
    </div>
  </div>
</div>`;
    document.body.appendChild(wrapper);
    wireEventListeners();
  }

  function wireEventListeners() {
    const closeBtn = document.getElementById('close-practice-modal');
    if (closeBtn) closeBtn.onclick = closeSetup;

    const startBtn = document.getElementById('start-practice-btn');
    if (startBtn) startBtn.onclick = startSession;

    const submitBtn = document.getElementById('practice-submit-btn');
    if (submitBtn) submitBtn.onclick = () => handleAnswerSubmit();

    const nextBtn = document.getElementById('practice-next-btn');
    if (nextBtn) nextBtn.onclick = nextQuestion;

    const endBtn = document.getElementById('practice-end-btn');
    if (endBtn) endBtn.onclick = endSession;

    const markWrongBtn = document.getElementById('practice-mark-wrong');
    if (markWrongBtn) markWrongBtn.onclick = () => handleOverride(false);

    const markRightBtn = document.getElementById('practice-mark-right');
    if (markRightBtn) markRightBtn.onclick = () => handleOverride(true);

    const drillBtn = document.getElementById('drill-weak-btn');
    if (drillBtn) drillBtn.onclick = startWeakDrill;

    // Setup pills logic
    document.querySelectorAll('.setup-pill').forEach(pill => {
      pill.onclick = (e) => {
        const parent = e.target.parentElement;
        if (parent.id === 'practice-topic-list') {
          e.target.classList.toggle('active');
        } else {
          parent.querySelectorAll('.setup-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          
          const mode = e.target.dataset.mode;
          if (mode) {
            const tpq = document.getElementById('time-per-q-section');
            const topics = document.getElementById('topic-section');
            const diffs = document.getElementById('diff-section');
            const noTimer = ['endless', 'sudden-death', 'progressive', 'review'];
            
            if (tpq) {
              tpq.style.opacity = noTimer.includes(mode) ? '0.3' : '1';
              tpq.style.pointerEvents = noTimer.includes(mode) ? 'none' : 'auto';
            }
            if (topics && diffs) {
              topics.style.display = mode === 'review' ? 'none' : 'block';
              diffs.style.display = mode === 'review' ? 'none' : 'block';
            }
          }
        }
      };
    });
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('practice-overlay');
      if (!overlay || !overlay.classList.contains('open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        endSession();
      } else if (e.key === 'Enter') {
        const submitVisible = !document.getElementById('practice-submit-btn').classList.contains('hidden');
        const nextVisible = !document.getElementById('practice-next-container').classList.contains('hidden');
        if (submitVisible) {
          e.preventDefault();
          document.getElementById('practice-submit-btn').click();
        } else if (nextVisible) {
          e.preventDefault();
          document.getElementById('practice-next-btn').click();
        }
      } else if (e.key === ' ' && state.isRevealed) {
        if (document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          nextQuestion();
        }
      }
    });
  }

  // ── SESSION MGMT ───────────────────────────────────────────────────────────
  function openSetup() {
    ensurePracticeDOM();
    populateTopics();
    const modal = document.getElementById('practice-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeSetup() {
    const modal = document.getElementById('practice-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function populateTopics() {
    const list = document.getElementById('practice-topic-list');
    if (!list || list.children.length > 0) return;
    
    const allQs = (typeof QUIZ_QUESTIONS !== 'undefined' ? QUIZ_QUESTIONS : []);
    const topics = [...new Set(allQs.map(q => q.topic))].filter(Boolean);
    
    topics.sort().forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'setup-pill';
      btn.textContent = t.toUpperCase();
      btn.dataset.topic = t;
      btn.onclick = () => btn.classList.toggle('active');
      list.appendChild(btn);
    });
  }

  function startSession() {
    const mode = document.querySelector('#mode-pills .active').dataset.mode;
    const seconds = parseInt(document.querySelector('#time-pills .active').dataset.seconds);
    const diff = document.querySelector('#diff-pills .active').dataset.difficulty;
    const topics = Array.from(document.querySelectorAll('#practice-topic-list .active')).map(p => p.dataset.topic);

    let pool = (typeof QUIZ_QUESTIONS !== 'undefined' ? QUIZ_QUESTIONS : []);
    
    if (mode === 'review') {
      if (window.QV && window.QV.sm2) {
        pool = window.QV.sm2.getDueQuestions(pool, 20);
        if (pool.length === 0) {
          showError("NO_QUESTIONS_DUE_FOR_REVIEW.");
          return;
        }
      } else {
        showError("SM2_MODULE_NOT_FOUND.");
        return;
      }
    } else {
      if (topics.length > 0) pool = pool.filter(q => topics.includes(q.topic));
      if (diff !== 'all') pool = pool.filter(q => q.difficulty === diff);

      if (mode === 'progressive') {
        pool = pool.filter(q => q.type === 'progressive');
      } else {
        const standard = pool.filter(q => !q.type || q.type === 'standard');
        if (standard.length >= 5) pool = standard;
      }
    }

    if (pool.length === 0) {
      showError("NO_QUESTIONS_MATCH_CRITERIA.");
      return;
    }

    // Shuffle
    pool.sort(() => Math.random() - 0.5);

    window.QV.practice.startWith({
      questions: pool.slice(0, mode === 'review' ? 20 : 30),
      mode: mode,
      secondsPerQ: seconds,
      isDaily: false
    });
  }

  function startWeakDrill() {
    const weakIds = Object.keys((window.state && window.state.getPerformance && window.state.getPerformance().weakQuestions) || {});
    const allQs = (typeof QUIZ_QUESTIONS !== 'undefined' ? QUIZ_QUESTIONS : []);
    const weakPool = allQs.filter(q => weakIds.includes(String(q.id)));
    
    if (weakPool.length === 0) {
      showError("NO_WEAK_SPOTS_FOUND.");
      return;
    }
    
    window.QV.practice.startWith({
      questions: weakPool,
      mode: 'endless'
    });
  }

  function showError(msg) {
    const err = document.getElementById('practice-mode-error');
    if (err) {
      err.textContent = msg;
      err.style.display = 'block';
      setTimeout(() => err.style.display = 'none', 3000);
    } else alert(msg);
  }

  // ── GAMEPLAY ───────────────────────────────────────────────────────────────
  function loadQuestion(index) {
    if (index >= state.questionPool.length) {
      endSession();
      return;
    }

    const q = state.questionPool[index];
    if (!q || !q.question || !q.answer) {
      console.warn("[practice] Skipping corrupt question", q);
      state.currentIndex++;
      loadQuestion(state.currentIndex);
      return;
    }

    state.currentIndex = index;
    state.isRevealed = false;
    state.nearMissAttempt = null;
    state._questionStartTime = Date.now();

    // Reset UI
    document.getElementById('practice-q-current').textContent = index + 1;
    document.getElementById('practice-q-total').textContent = state.questionPool.length;
    document.getElementById('practice-topic-tag').textContent = (q.topic || 'general').toUpperCase();
    
    const activeCard = document.querySelector('.practice-card-active');
    if (activeCard) {
      activeCard.classList.remove('q-easy', 'q-medium', 'q-hard');
      activeCard.classList.add('q-' + (q.difficulty || 'easy'));
    }
    const qTextEl = document.getElementById('practice-q-text');
    const qImgEl = document.getElementById('practice-q-image');

    // YouTube auto-embed: detect YT URL in question text → strip URL, render iframe
    var ytResult = (window.QV && window.QV.youtube)
      ? window.QV.youtube.processText(q.question.text)
      : { cleanedText: q.question.text, embedHTML: '', missingVideo: false };

    qTextEl.textContent = ytResult.cleanedText;

    var embedHTML = ytResult.embedHTML ||
      (ytResult.missingVideo ? window.QV.youtube.missingVideoNotice() : '');
    var imgHTML   = q.question.image
      ? '<img src="' + q.question.image + '" style="max-width:100%; border:3px solid var(--ink); margin-top:16px;">'
      : '';
    qImgEl.innerHTML = embedHTML + imgHTML;

    document.getElementById('practice-feedback').classList.add('hidden');
    document.getElementById('practice-reveal').classList.add('hidden');
    document.getElementById('practice-next-container').classList.add('hidden');
    document.getElementById('practice-submit-btn').classList.remove('hidden');

    const input = document.getElementById('practice-answer-input');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    // Reset next button state in case sudden-death overwrote it
    const nxtBtn = document.getElementById('practice-next-btn');
    if (nxtBtn) {
      nxtBtn.textContent = 'NEXT_QUESTION →';
      nxtBtn.onclick = nextQuestion;
    }
    
    // Fav/Wiki status
    updateFavWikiButtons(q);

    if (state.mode === 'timed') {
      document.getElementById('practice-timer-container').style.display = 'block';
      startTimer();
    } else {
      document.getElementById('practice-timer-container').style.display = 'none';
    }
  }

  function updateFavWikiButtons(q) {
    const favBtn = document.getElementById('practice-fav-btn');
    const wikiBtn = document.getElementById('practice-wiki-btn');
    if (!favBtn || !wikiBtn || !window.state) return;

    const isFav = window.state.isFavorite(q.id);
    favBtn.textContent = isFav ? 'FAVORITED' : 'FAVORITE';
    favBtn.style.color = isFav ? 'var(--hot)' : '';
    favBtn.onclick = (e) => {
      e.stopPropagation();
      window.state.toggleFavorite(q.id);
      updateFavWikiButtons(q);
    };

    const isWiki = window.state.isSavedToWiki(q.id);
    wikiBtn.textContent = isWiki ? 'SAVED' : 'SAVE_TO_WIKI';
    wikiBtn.style.color = isWiki ? 'var(--hot)' : '';
    wikiBtn.onclick = (e) => {
      e.stopPropagation();
      if (isWiki) window.state.removeFromWiki(q.id);
      else window.state.saveToWiki(q.id);
      updateFavWikiButtons(q);
    };
  }

  function startTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = state.secondsPerQ;
    updateTimerUI();
    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      updateTimerUI();
      if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        handleAnswerSubmit(true);
      }
    }, 1000);
  }

  function updateTimerUI() {
    const text = document.getElementById('practice-timer-text');
    const fill = document.getElementById('practice-timer-fill');
    if (!text || !fill) return;

    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    text.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    
    const pct = (state.timeLeft / state.secondsPerQ) * 100;
    fill.style.width = `${pct}%`;

    const bar = fill.parentElement;
    if (state.timeLeft <= 10) {
      bar.classList.add('danger');
      if (window.playTick && state.timeLeft > 0) window.playTick();
      // Short clean shake each second at <=5s (uses QV.anim.shakeTimer, not overlapping)
      if (state.timeLeft <= 5 && state.timeLeft > 0 && window.QV && window.QV.anim) {
        window.QV.anim.shakeTimer(bar);
      }
    } else {
      bar.classList.remove('danger');
      if (window.gsap) window.gsap.set(bar, { x: 0 });
    }
  }

  function handleAnswerSubmit(isTimeout = false) {
    if (state.isRevealed) return;
    clearInterval(state.timerInterval);

    const input = document.getElementById('practice-answer-input');
    const userInput = input.value;
    const q = state.questionPool[state.currentIndex];

    let isCorrect = isTimeout ? false : checkAnswer(userInput, q.answer.text);

    // Near-Miss check
    if (!isCorrect && !isTimeout && userInput.trim().length >= 4) {
      const temp = document.createElement('div');
      temp.innerHTML = q.answer.text || '';
      const plainAnswer = temp.textContent || '';
      const dist = getLevenshteinDistance(userInput, plainAnswer);
      if (dist <= 2 && state.nearMissAttempt !== q.id) {
        state.nearMissAttempt = q.id;
        const feedback = document.getElementById('practice-feedback');
        feedback.textContent = 'ALMOST. // CHECK_SPELLING!';
        feedback.className = 'practice-feedback warning';
        feedback.classList.remove('hidden');
        if (window.playTick) window.playTick();
        input.focus();
        // Re-start timer for a quick fix?
        if (state.mode === 'timed') startTimer();
        return;
      }
    }

    state.isRevealed = true;
    input.disabled = true;

    const feedback = document.getElementById('practice-feedback');
    feedback.classList.remove('hidden');

    if (isCorrect) {
      state.sessionStats.correct++;
      state.emojiHistory.push('🟩');
      state.comboStreak++;
      feedback.textContent = getRewardText();
      feedback.className = 'practice-feedback correct';
      if (window.playCorrect) window.playCorrect();
      if (window.playStreakSound && state.comboStreak % 5 === 0) window.playStreakSound(state.comboStreak);
    } else {
      state.sessionStats.wrong++;
      state.emojiHistory.push('🟥');
      state.comboStreak = 0;
      feedback.textContent = isTimeout ? 'TIME_UP!' : 'WRONG_ANSWER';
      feedback.className = 'practice-feedback wrong';
      if (window.playIncorrect) window.playIncorrect();
      
      // Spaced repetition: return in 15 questions
      state.missedQueue.push({ qid: q.id, returnAtIndex: state.currentIndex + 15 });
    }

    // Persist to local global state if exists
    if (window.state && window.state.recordResult) {
      window.state.recordResult(q.topic, isCorrect, 1, q.id);
    }
    
    // SM-2 Review integration
    if (window.QV && window.QV.sm2) {
      const quality = isCorrect ? (Date.now() - state._questionStartTime < 5000 ? 5 : 4) : 1;
      window.QV.sm2.review(q.id, quality);
    }

    revealAnswer(q);
  }

  function getRewardText() {
    const elapsed = Date.now() - state._questionStartTime;
    let base = 'CORRECT!';
    if (elapsed < 5000) base = '⚡ SPEED_DEMON!';
    if (state.comboStreak >= 10) return `${base} // UNSTOPPABLE ⚡⚡⚡`;
    if (state.comboStreak >= 5) return `${base} // HOT STREAK 🔥🔥🔥`;
    if (state.comboStreak >= 3) return `${base} // COMBO 3X! 🔥`;
    return base;
  }

  function revealAnswer(q) {
    const reveal = document.getElementById('practice-reveal');
    reveal.classList.remove('hidden');
    document.getElementById('practice-correct-text').innerHTML = q.answer.text;
    
    const fundaText = (q.funda && q.funda.text) ? q.funda.text : '';
    const fundaSection = document.querySelector('#practice-reveal .reveal-section:last-child');
    if (fundaSection) fundaSection.style.display = fundaText ? '' : 'none';
    document.getElementById('practice-funda-text').innerHTML = fundaText;

    const imgContainer = document.getElementById('practice-correct-image');
    imgContainer.innerHTML = '';
    if (q.answer.image) {
      const img = document.createElement('img');
      img.src = q.answer.image;
      img.alt = 'Answer explanation image';
      img.style.maxWidth = '100%';
      img.style.border = '3px solid var(--ink)';
      img.style.marginTop = '12px';
      imgContainer.appendChild(img);
    }

    document.getElementById('practice-submit-btn').classList.add('hidden');
    document.getElementById('practice-next-container').classList.remove('hidden');

    if (state.mode === 'sudden-death' && !state.emojiHistory[state.emojiHistory.length-1].includes('🟩')) {
      // Sudden death end
      const nxt = document.getElementById('practice-next-btn');
      if (nxt) {
        nxt.textContent = 'VIEW_RESULTS →';
        nxt.onclick = endSession;
      }
    }
  }

  function handleOverride(toCorrect) {
    const q = state.questionPool[state.currentIndex];
    const isActuallyCorrect = state.emojiHistory[state.emojiHistory.length-1] === '🟩';
    
    if (toCorrect && !isActuallyCorrect) {
      state.sessionStats.correct++;
      state.sessionStats.wrong--;
      state.emojiHistory[state.emojiHistory.length-1] = '🟩';
      document.getElementById('practice-feedback').textContent = 'OVERRIDDEN: CORRECT';
      document.getElementById('practice-feedback').className = 'practice-feedback correct';
    } else if (!toCorrect && isActuallyCorrect) {
      state.sessionStats.correct--;
      state.sessionStats.wrong++;
      state.emojiHistory[state.emojiHistory.length-1] = '🟥';
      document.getElementById('practice-feedback').textContent = 'OVERRIDDEN: WRONG';
      document.getElementById('practice-feedback').className = 'practice-feedback wrong';
    }
    nextQuestion();
  }

  function nextQuestion() {
    state.currentIndex++;
    
    // Check missed queue for spaced repetition
    const due = state.missedQueue.find(m => m.returnAtIndex === state.currentIndex);
    if (due) {
      const q = (typeof QUIZ_QUESTIONS !== 'undefined' ? QUIZ_QUESTIONS : []).find(x => x.id === due.qid);
      if (q) {
        state.questionPool.splice(state.currentIndex, 0, q);
        state.missedQueue = state.missedQueue.filter(m => m !== due);
      }
    }

    loadQuestion(state.currentIndex);
  }

  // ── SCORING & UTILS ────────────────────────────────────────────────────────
  function checkAnswer(userInput, correctText) {
    if (!userInput || userInput.trim().length < 2) return false;
    const temp = document.createElement('div');
    temp.innerHTML = correctText || '';
    const plain = (temp.textContent || '').trim();
    if (!plain) return false;

    const candidates = new Set();
    Array.from(temp.querySelectorAll('strong')).forEach(s => {
      const v = s.textContent.trim().toLowerCase();
      if (v) candidates.add(v);
    });
    candidates.add(plain.toLowerCase());
    
    const firstPart = plain.split(/[.,;\?!]/)[0].trim().toLowerCase();
    if (firstPart) candidates.add(firstPart);

    plain.toLowerCase().split(/\s+/).forEach(w => {
      const cleaned = w.replace(/[^\w]/g, '');
      if (cleaned.length >= 4) candidates.add(cleaned);
    });

    const user = normalize(userInput);
    if (!user) return false;

    for (const raw of candidates) {
      const cand = normalize(raw);
      if (!cand) continue;
      if (user === cand) return true;
      if (cand.split(' ').includes(user) && user.length >= 4) return true;
      if (user.split(' ').includes(cand) && cand.length >= 4) return true;
      if (cand.length <= 30 && similarity(user, cand) >= 0.82) return true;
    }
    return false;
  }

  function normalize(s) {
    if (!s) return '';
    return s.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Strips accents
      .replace(/[\u201c\u201d\u2018\u2019]/g, '"')      // Normalizes curly quotes
      .replace(/[^a-z0-9\s]/g, '')                      // Strips special punctuation
      .replace(/\s+/g, ' ')                             // Normalizes spaces
      .trim();
  }

  function similarity(s1, s2) {
    let longer = s1, shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
  }

  function editDistance(s1, s2) {
    s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  function getLevenshteinDistance(s1, s2) {
    const a = normalize(s1), b = normalize(s2);
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
        else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  // ── END OF SESSION ─────────────────────────────────────────────────────────
  function endSession() {
    clearInterval(state.timerInterval);
    const total = state.sessionStats.correct + state.sessionStats.wrong;
    const accuracy = total === 0 ? 0 : Math.round((state.sessionStats.correct / total) * 100);
    const emojiStr = state.emojiHistory.join(' ');
    
    // Save daily if applicable
    if (state.isDaily) {
      const todaySeed = (window.QV && window.QV.daily) ? window.QV.daily.seed() : 0;
      const key = 'daily_' + todaySeed;
      localStorage.setItem(key, JSON.stringify({
        correct: state.sessionStats.correct,
        total: state.questionPool.length,
        completedAt: Date.now()
      }));
      // Streak logic
      const lastPlayed = localStorage.getItem('daily_last_played');
      const yesterdaySeed = todaySeed - 1; // Simplistic, but works for same-month
      if (lastPlayed === String(yesterdaySeed)) {
        const streak = parseInt(localStorage.getItem('daily_streak') || '0') + 1;
        localStorage.setItem('daily_streak', streak);
      } else if (lastPlayed !== String(todaySeed)) {
        localStorage.setItem('daily_streak', 1);
      }
      localStorage.setItem('daily_last_played', todaySeed);
    }

    showSummaryScreen(accuracy, total, emojiStr);
    clearSessionDraft();
  }

  function showSummaryScreen(accuracy, total, emojiStr) {
    const screen = document.getElementById('session-summary');
    if (!screen) return;

    document.getElementById('summary-accuracy').textContent = accuracy + '%';
    document.getElementById('summary-score').textContent = state.sessionStats.correct + ' / ' + total + ' CORRECT';
    document.getElementById('summary-correct').textContent = state.sessionStats.correct;
    document.getElementById('summary-wrong').textContent = state.sessionStats.wrong;
    document.getElementById('summary-mode').textContent = state.mode.toUpperCase().replace('-', '_');
    document.getElementById('summary-emoji').textContent = emojiStr;

    screen.style.display = 'flex';
    screen.classList.add('open');
    screen.setAttribute('aria-hidden', 'false');

    document.getElementById('summary-share-btn').onclick = () => {
      const summary = `🎯 QUIZVAULT // ${state.isDaily ? 'DAILY' : 'PRACTICE'}\n${emojiStr}\n${state.sessionStats.correct} / ${total} correct\nquizvault.netlify.app`;
      navigator.clipboard.writeText(summary).then(() => {
        const btn = document.getElementById('summary-share-btn');
        btn.textContent = 'COPIED! ✓';
        setTimeout(() => { btn.textContent = 'COPY_RESULT 📋'; }, 2000);
      });
    };

    document.getElementById('summary-again-btn').onclick = () => {
      screen.style.display = 'none';
      screen.classList.remove('open');
      document.body.style.overflow = '';
      openSetup();
    };

    document.getElementById('summary-close-btn').onclick = () => {
      screen.style.display = 'none';
      screen.classList.remove('open');
      document.getElementById('practice-overlay').classList.remove('open');
      document.body.style.overflow = '';
    };
  }

  function saveSessionDraft() {
    const draft = {
      pool: state.questionPool,
      mode: state.mode,
      secondsPerQ: state.secondsPerQ,
      currentIndex: state.currentIndex,
      stats: state.sessionStats,
      missed: state.missedQueue,
      isDaily: state.isDaily,
      timestamp: Date.now()
    };
    localStorage.setItem('qv_practice_draft', JSON.stringify(draft));
  }

  function clearSessionDraft() {
    localStorage.removeItem('qv_practice_draft');
  }

  function init() {
    ensurePracticeDOM();
    
    // Existing setup panel triggers
    document.querySelectorAll('#practice-btn, #hero-practice-btn').forEach(btn => {
      btn.onclick = openSetup;
    });

    // Auto-recover session draft if exists
    const draft = localStorage.getItem('qv_practice_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (Date.now() - d.timestamp < 1000 * 60 * 60 * 2) { // 2 hours
           // Optional: confirm recovery
           // For now, we'll just keep the logic ready
        }
      } catch(e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Global triggers for external scripts
  window.openPracticeSetup = openSetup;

})();
