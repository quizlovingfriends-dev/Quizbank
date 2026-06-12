/**
 * practice-page.js — full-page type-and-verify practice.
 *
 * No modal. Renders one question at a time directly into the page using
 * brutalist Stitch design (timer / streak header, big question, image,
 * input, CHECK/SKIP, shake-on-wrong, +1 pop on right).
 *
 * Reads URL params:
 *   ?topic=history   — filter to one topic
 *   ?difficulty=hard — filter to one difficulty
 *   ?count=20        — session length (default 10)
 *   ?timer=30        — seconds per question (default 60; 0 = no timer)
 *   ?source=weak     — drill weak cards (lowest SM-2 accuracy first)
 *
 * DOM contract (practice.html when #practice-stage exists):
 *   #practice-stage        — root container; this script fills it
 *   #practice-launcher     — the initial launcher card (hidden once session starts)
 *
 * Persists per-question outcome to localStorage.qv_sm2_state when sm2.js
 * is loaded (uses window.sm2.review if available).
 */
(function () {
    'use strict';

    var CONFIG = {
        sessionLength: 10,
        timerSeconds: 60
    };

    function getQuestions() {
        return (typeof QUIZ_QUESTIONS !== 'undefined') ? QUIZ_QUESTIONS.slice() : [];
    }

    // Practice mode is for SHORT-answer questions only — one or two words,
    // names, dates, single facts. Anything that needs an explanation belongs
    // in the question bank, not practice.
    function isShortAnswer(q) {
        if (q.type && q.type !== 'standard' && q.type !== 'qa') return false; // skip progressive/grid-flip etc.
        var ans = ((q.answer || {}).text || q.answer_text || '').replace(/<[^>]+>/g, '').trim();
        if (!ans) return false;
        // Take only the first sentence (typed-answer focus is the first claim)
        var firstSentence = ans.split(/[.!?]/)[0].trim();
        var words = firstSentence.split(/\s+/).filter(Boolean);
        // Allow up to 6 words OR up to 45 chars — covers names, places, dates,
        // short phrases like "Samuel Morse", "1989", "Pacific Ocean", "Indira Gandhi"
        return words.length <= 6 && firstSentence.length <= 45;
    }

    function normalize(s) {
        return (s || '').toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ').trim();
    }

    function isCorrect(user, expected) {
        var u = normalize(user), e = normalize(expected);
        if (!u || !e) return false;
        if (u === e) return true;
        if (e.length >= 4 && u.indexOf(e) !== -1) return true;
        if (u.length >= 4 && e.indexOf(u) !== -1) return true;
        // Lenient: first word match if expected is multi-word
        var eFirst = e.split(' ')[0];
        if (eFirst.length >= 4 && u === eFirst) return true;
        return false;
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function loadSm2() {
        try { return JSON.parse(localStorage.getItem('qv_sm2_state') || '{}'); }
        catch (e) { return {}; }
    }
    function saveSm2(state) {
        try { localStorage.setItem('qv_sm2_state', JSON.stringify(state)); }
        catch (e) {}
    }

    function pickSession(opts) {
        var pool = getQuestions().filter(isShortAnswer);
        if (opts.topic)      pool = pool.filter(function (q) { return q.topic === opts.topic; });
        if (opts.difficulty) pool = pool.filter(function (q) { return q.difficulty === opts.difficulty; });
        if (opts.source === 'weak') {
            var sm = loadSm2();
            pool.sort(function (a, b) {
                var sa = sm[a.id] || {}, sb = sm[b.id] || {};
                var aRate = sa.attempts ? sa.correct / sa.attempts : 1;
                var bRate = sb.attempts ? sb.correct / sb.attempts : 1;
                return aRate - bRate;  // worst first
            });
        } else {
            shuffle(pool);
        }
        return pool.slice(0, opts.count);
    }

    function recordOutcome(qid, correct) {
        var sm = loadSm2();
        var c = sm[qid] || { attempts: 0, correct: 0, ef: 2.5, interval: 1 };
        c.attempts = (c.attempts || 0) + 1;
        if (correct) c.correct = (c.correct || 0) + 1;
        c.lastSeen = Date.now();
        // Very simple SM-2 lite: bump interval on correct, reset on wrong
        if (correct) c.interval = Math.min((c.interval || 1) * 2, 30);
        else c.interval = 1;
        sm[qid] = c;
        saveSm2(sm);
    }

    // ============================================================
    // Renderers
    // ============================================================

    function renderStage(session, state) {
        var stage = document.getElementById('practice-stage');
        if (!stage) return;

        if (state.index >= session.length) {
            renderEnd(stage, session, state);
            return;
        }

        var q = session[state.index];
        var qText = (q.question && q.question.text) || q.question_text || '';
        var qImage = (q.question && q.question.image) || q.question_image_path || null;
        var dots = '';
        for (var i = 0; i < session.length; i++) {
            dots += '<span style="color:' + (i < state.index ? '#ba0034' : i === state.index ? '#000' : '#cfcfcf') + '">●</span>';
        }

        var imageHtml = '';
        if (qImage && typeof qImage === 'string') {
            imageHtml =
                '<div class="w-full max-w-2xl border-[3px] border-black bg-surface-container hard-shadow mt-6" style="aspect-ratio:21/9;overflow:hidden;">' +
                    '<img src="' + escapeHtml(qImage) + '" alt="Question image" ' +
                         'style="width:100%;height:100%;object-fit:cover;display:block;" ' +
                         'onerror="this.parentNode.style.display=\'none\'">' +
                '</div>';
        }

        stage.innerHTML =
            '<div id="practice-card" class="w-full max-w-4xl mx-auto bg-surface border-[3px] border-black hard-shadow flex flex-col" style="transition:transform .15s ease;">' +
                '<header class="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-surface-container font-section-label text-section-label tracking-[4px] uppercase">' +
                    '<div class="flex items-center gap-4 text-primary">' +
                        '<span class="text-[14px]">' + dots + '</span>' +
                        '<span>Q.' + String(state.index + 1).padStart(2, '0') + '/' + String(session.length).padStart(2, '0') + '</span>' +
                    '</div>' +
                    '<div class="flex items-center gap-6">' +
                        (CONFIG.timerSeconds > 0 ? '<div class="flex items-center gap-2"><span>⏱</span><span id="practice-timer" class="font-bold">' + formatTime(state.timer) + '</span></div>' : '') +
                        '<div class="flex items-center gap-2"><span>🔥</span><span class="font-bold text-secondary">' + state.streak + ' STREAK</span></div>' +
                    '</div>' +
                '</header>' +
                '<div class="p-8 flex flex-col gap-2 relative">' +
                    '<div id="plus-one" class="absolute top-8 right-8 font-hero-display text-[48px] font-black text-[#00c853] opacity-0 pointer-events-none" style="z-index:50;">+1</div>' +
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">' + escapeHtml((q.topic || 'GENERAL').toUpperCase()) + '</div>' +
                    '<h1 class="font-headline-lg-mobile md:text-[40px] font-black text-primary uppercase tracking-tighter leading-[1.1] mt-2">' +
                        escapeHtml(qText) +
                    '</h1>' +
                    imageHtml +
                    '<div class="mt-8">' +
                        '<label class="font-section-label text-section-label uppercase block mb-2" for="practice-input">YOUR ANSWER</label>' +
                        '<input id="practice-input" type="text" autocomplete="off" autocapitalize="characters" ' +
                               'class="w-full border-[3px] border-black bg-surface-container p-4 font-body-md text-[16px] uppercase text-primary focus:bg-white focus:outline-none transition-colors hard-shadow" ' +
                               'placeholder="TYPE YOUR ANSWER">' +
                        '<p id="practice-feedback" class="mt-3 font-section-label text-section-label uppercase hidden"></p>' +
                    '</div>' +
                '</div>' +
                '<footer class="p-8 pt-0 flex gap-4">' +
                    '<button id="practice-skip" class="flex-1 bg-surface text-primary border-[3px] border-black font-ui-button text-ui-button py-4 uppercase hard-shadow">SKIP</button>' +
                    '<button id="practice-check" class="flex-[2] bg-secondary text-on-secondary border-[3px] border-black font-ui-button text-ui-button py-4 uppercase hard-shadow">CHECK</button>' +
                '</footer>' +
                '<div id="practice-next-row" class="px-8 pb-8 hidden">' +
                    '<button id="practice-next" class="w-full bg-primary text-on-primary border-[3px] border-black font-ui-button text-ui-button py-4 uppercase hard-shadow">NEXT QUESTION →</button>' +
                '</div>' +
            '</div>';

        wireQuestion(q, session, state);
    }

    function formatTime(sec) {
        if (sec < 0) sec = 0;
        var m = Math.floor(sec / 60), s = sec % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function wireQuestion(q, session, state) {
        var input    = document.getElementById('practice-input');
        var checkBtn = document.getElementById('practice-check');
        var skipBtn  = document.getElementById('practice-skip');
        var nextRow  = document.getElementById('practice-next-row');
        var nextBtn  = document.getElementById('practice-next');
        var feedback = document.getElementById('practice-feedback');
        var card     = document.getElementById('practice-card');
        var plusOne  = document.getElementById('plus-one');
        var timerEl  = document.getElementById('practice-timer');

        if (!input || !checkBtn) return;
        input.focus();

        // Timer
        if (CONFIG.timerSeconds > 0 && state.timerInterval == null) {
            state.timerInterval = setInterval(function () {
                state.timer -= 1;
                if (timerEl) timerEl.textContent = formatTime(state.timer);
                if (state.timer <= 0) {
                    clearInterval(state.timerInterval);
                    state.timerInterval = null;
                    doCheck(true); // auto-submit on timeout
                }
            }, 1000);
        }

        function lockInputs() {
            input.disabled = true;
            checkBtn.disabled = true;
            skipBtn.disabled = true;
            checkBtn.style.opacity = '.5';
            skipBtn.style.opacity = '.5';
        }

        function doCheck(timeout) {
            if (input.disabled) return;
            if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }

            var userAns = input.value;
            var expected = (q.answer && q.answer.text) || q.answer_text || '';
            var ok = !timeout && isCorrect(userAns, expected);

            recordOutcome(q.id, ok);
            state.attempts += 1;
            if (ok) {
                state.correct += 1;
                state.streak += 1;
                feedback.classList.remove('hidden');
                feedback.style.color = '#00c853';
                feedback.textContent = '✓ CORRECT — ' + expected;
                if (card) card.style.borderColor = '#00c853';
                if (plusOne) {
                    plusOne.style.transition = 'opacity .15s, transform .5s ease-out';
                    plusOne.style.opacity = '1';
                    plusOne.style.transform = 'translateY(-30px) scale(1.2)';
                    setTimeout(function () { plusOne.style.opacity = '0'; plusOne.style.transform = ''; }, 700);
                }
            } else {
                state.streak = 0;
                feedback.classList.remove('hidden');
                feedback.style.color = '#ba0034';
                feedback.textContent = timeout
                    ? '✗ TIME OUT — ANSWER: ' + expected
                    : '✗ INCORRECT — ANSWER: ' + expected;
                if (card) {
                    card.style.transition = 'transform .08s';
                    card.style.transform = 'translateX(-8px)';
                    setTimeout(function () { card.style.transform = 'translateX(8px)'; }, 80);
                    setTimeout(function () { card.style.transform = ''; }, 160);
                }
            }
            lockInputs();
            if (nextRow) nextRow.classList.remove('hidden');
            if (nextBtn) nextBtn.focus();
        }

        checkBtn.addEventListener('click', function () { doCheck(false); });
        skipBtn.addEventListener('click', function () {
            state.streak = 0;
            recordOutcome(q.id, false);
            feedback.classList.remove('hidden');
            feedback.style.color = '#747878';
            feedback.textContent = '— SKIPPED — ANSWER: ' + ((q.answer && q.answer.text) || '');
            lockInputs();
            if (nextRow) nextRow.classList.remove('hidden');
            if (nextBtn) nextBtn.focus();
        });
        nextBtn.addEventListener('click', function () {
            state.index += 1;
            state.timer = CONFIG.timerSeconds;
            renderStage(window.__practice_session, state);
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doCheck(false);
        });
    }

    function renderEnd(stage, session, state) {
        var pct = session.length ? Math.round((state.correct / session.length) * 100) : 0;
        var msg = pct >= 80 ? 'EXCELLENT' : pct >= 60 ? 'GOOD' : pct >= 40 ? 'KEEP_PRACTICING' : 'NEEDS_DRILL';

        stage.innerHTML =
            '<div class="w-full max-w-4xl mx-auto bg-primary text-on-primary border-[3px] border-black hard-shadow p-12">' +
                '<div class="font-section-label text-section-label uppercase opacity-70 mb-4">SESSION TERMINATED</div>' +
                '<h1 class="font-hero-display text-[80px] md:text-[120px] font-black leading-none mb-8">' + pct + '%</h1>' +
                '<div class="grid grid-cols-3 gap-4 border-y-2 border-white py-6 mb-8">' +
                    '<div><div class="text-[40px] font-black">' + state.correct + '</div><div class="font-section-label text-section-label uppercase opacity-70 mt-1">CORRECT</div></div>' +
                    '<div><div class="text-[40px] font-black">' + (session.length - state.correct) + '</div><div class="font-section-label text-section-label uppercase opacity-70 mt-1">MISSED</div></div>' +
                    '<div><div class="text-[40px] font-black text-secondary">' + msg + '</div><div class="font-section-label text-section-label uppercase opacity-70 mt-1">VERDICT</div></div>' +
                '</div>' +
                '<div class="flex flex-col md:flex-row gap-4">' +
                    '<button id="practice-restart" class="flex-1 bg-secondary text-on-secondary border-[3px] border-white py-4 px-8 font-ui-button text-ui-button uppercase">RUN AGAIN</button>' +
                    '<a href="questionbank.html" class="flex-1 bg-transparent text-on-primary border-[3px] border-white py-4 px-8 font-ui-button text-ui-button uppercase text-center">BACK TO BANK</a>' +
                '</div>' +
            '</div>';

        var btn = document.getElementById('practice-restart');
        if (btn) btn.addEventListener('click', function () { window.location.reload(); });
    }

    // ============================================================
    // Entry
    // ============================================================

    function start(opts) {
        var session = pickSession(opts);
        if (!session.length) {
            var stage = document.getElementById('practice-stage');
            if (stage) stage.innerHTML = '<div class="bg-surface border-[3px] border-black p-8 hard-shadow text-center"><div class="font-section-label text-section-label uppercase text-secondary mb-4">NO QUESTIONS MATCH</div><div class="font-body-md text-body-md">Adjust filters and try again.</div></div>';
            return;
        }
        window.__practice_session = session;
        var state = { index: 0, correct: 0, attempts: 0, streak: 0, timer: CONFIG.timerSeconds, timerInterval: null };

        var launcher = document.getElementById('practice-launcher');
        if (launcher) launcher.style.display = 'none';
        var stage = document.getElementById('practice-stage');
        if (stage) stage.style.display = 'block';

        renderStage(session, state);
    }

    function init() {
        var params = new URLSearchParams(window.location.search);
        var opts = {
            topic:      params.get('topic') || null,
            difficulty: params.get('difficulty') || null,
            count:      parseInt(params.get('count') || '10', 10),
            source:     params.get('source') || null
        };
        var timer = parseInt(params.get('timer') || '60', 10);
        CONFIG.timerSeconds = isNaN(timer) ? 60 : timer;

        // If URL has auto=1, start immediately
        if (params.get('auto') === '1') {
            start(opts);
            return;
        }

        // Otherwise, wire the launcher buttons
        var beginBtn = document.getElementById('hero-practice-btn');
        var drillBtn = document.getElementById('drill-weak-btn');
        if (beginBtn) beginBtn.addEventListener('click', function () { start(opts); });
        if (drillBtn) drillBtn.addEventListener('click', function () {
            start({ count: opts.count, source: 'weak' });
        });

        // Quick-pick buttons (if user added any)
        document.querySelectorAll('[data-practice-topic]').forEach(function (el) {
            el.addEventListener('click', function () {
                start({ topic: el.dataset.practiceTopic, count: opts.count });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
