/**
 * daily.js — Today's deterministic 5-question briefing.
 *
 * Picks 5 questions seeded by YYYY-MM-DD so everyone gets the same set.
 * Persists per-question state to localStorage: qv_daily_YYYY-MM-DD = {q_id: {answered, correct, attempts}}.
 *
 * DOM contract (daily.html):
 *   #daily-date      — text element for "DD.MM.YYYY"
 *   #daily-difficulty— text element for "DIFFICULTY: X"
 *   #daily-questions — container that this script fills
 *   .daily-q-card[data-qid] — generated card; child #q-{id}-input, #q-{id}-check, #q-{id}-skip, #q-{id}-feedback
 *   #daily-finalize  — submit briefing button
 *   #daily-progress  — "Q.NN/05 — N answered" counter
 */
(function () {
    'use strict';

    function todayStamp() {
        var d = new Date();
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    function prettyDate(stamp) {
        // 2026-06-07 → 06.07.2026  (DD.MM.YYYY style for the brutalist hero)
        var p = stamp.split('-');
        return p[2] + '.' + p[1] + '.' + p[0];
    }

    // Deterministic PRNG (mulberry32) seeded from date string
    function seedFromString(str) {
        var h = 2166136261 >>> 0;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h;
    }
    function mulberry32(seed) {
        return function () {
            seed = (seed + 0x6D2B79F5) >>> 0;
            var t = seed;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pickToday(stamp, allQs, count) {
        if (!allQs || !allQs.length) return [];
        var rng = mulberry32(seedFromString(stamp));
        var pool = allQs.slice();
        // Fisher-Yates with seeded RNG
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
        }
        return pool.slice(0, count);
    }

    function normalizeAnswer(s) {
        return (s || '')
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isCorrect(userInput, expectedText) {
        var u = normalizeAnswer(userInput);
        var e = normalizeAnswer(expectedText);
        if (!u || !e) return false;
        if (u === e) return true;
        // Also accept if user answer contains the expected (or vice versa, for short answers)
        if (e.length >= 4 && u.indexOf(e) !== -1) return true;
        if (u.length >= 4 && e.indexOf(u) !== -1) return true;
        return false;
    }

    function loadState(stamp) {
        try { return JSON.parse(localStorage.getItem('qv_daily_' + stamp) || '{}'); }
        catch (e) { return {}; }
    }
    function saveState(stamp, state) {
        try { localStorage.setItem('qv_daily_' + stamp, JSON.stringify(state)); }
        catch (e) { /* quota or private mode */ }
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }

    function topicLabel(t) {
        return (t || 'GENERAL').toUpperCase().replace('-', ' ');
    }

    function difficultyLabel(qs) {
        var hard = qs.filter(function (q) { return q.difficulty === 'hard'; }).length;
        var med  = qs.filter(function (q) { return q.difficulty === 'medium'; }).length;
        if (hard >= 3) return 'HIGH';
        if (hard + med >= 3) return 'MEDIUM';
        return 'STANDARD';
    }

    function renderCard(q, idx, state) {
        var qid = q.id;
        var savedAnswer = (state[qid] || {}).answer || '';
        var savedCorrect = (state[qid] || {}).correct;
        var qText = (q.question && q.question.text) || q.question_text || '';
        var qImage = (q.question && q.question.image) || q.question_image_path || null;
        var topic = topicLabel(q.topic);

        var imageHtml = '';
        if (qImage && typeof qImage === 'string') {
            imageHtml =
                '<div class="border-[3px] border-black mb-8 max-w-2xl">' +
                    '<img src="' + escapeHtml(qImage) + '" alt="Question image" ' +
                         'style="display:block;width:100%;height:auto;max-height:420px;object-fit:contain;background:#f7f3f2;" ' +
                         'onerror="this.parentNode.style.display=\'none\'">' +
                '</div>';
        }

        return (
            '<article class="bg-surface border-[3px] border-black hard-shadow daily-q-card" data-qid="' + qid + '">' +
                '<header class="border-b-2 border-black p-4 bg-primary text-on-primary flex justify-between items-center">' +
                    '<span class="font-section-label text-section-label tracking-[4px]">Q.0' + (idx + 1) + '</span>' +
                    '<span class="font-section-label text-section-label text-surface-variant">' + escapeHtml(topic) + '</span>' +
                '</header>' +
                '<div class="p-6 md:p-8">' +
                    '<p class="font-body-md text-[18px] md:text-[22px] leading-relaxed text-primary mb-6 font-bold">' +
                        escapeHtml(qText) +
                    '</p>' +
                    imageHtml +
                    '<div class="space-y-3">' +
                        '<label class="block font-section-label text-section-label text-primary" for="q-' + qid + '-input">YOUR ANSWER :</label>' +
                        '<input id="q-' + qid + '-input" type="text" ' +
                               'class="w-full bg-surface-container border-[3px] border-black p-4 font-body-md text-[14px] uppercase text-primary focus:bg-white focus:outline-none transition-colors" ' +
                               'placeholder="ENTER EXACT TERM..." value="' + escapeHtml(savedAnswer) + '"' +
                               (savedCorrect === true ? ' disabled' : '') + '>' +
                    '</div>' +
                    '<p id="q-' + qid + '-feedback" class="mt-3 font-section-label text-section-label uppercase ' +
                        (savedCorrect === true ? 'text-[#00c853]' : savedCorrect === false ? 'text-secondary' : 'hidden') + '">' +
                        (savedCorrect === true ? '✓ CORRECT' : savedCorrect === false ? '✗ INCORRECT' : '') +
                    '</p>' +
                    '<div class="mt-8 flex flex-col sm:flex-row gap-4 border-t-2 border-surface-variant pt-6">' +
                        '<button id="q-' + qid + '-check" class="font-ui-button text-ui-button bg-secondary text-on-secondary border-[3px] border-black py-4 px-8 hard-shadow flex-1 uppercase">CHECK</button>' +
                        '<button id="q-' + qid + '-skip"  class="font-ui-button text-ui-button bg-transparent text-primary border-[3px] border-black py-4 px-8 hard-shadow flex-1 md:flex-none uppercase">SKIP</button>' +
                    '</div>' +
                '</div>' +
            '</article>'
        );
    }

    function init() {
        var qs = (typeof QUIZ_QUESTIONS !== 'undefined') ? QUIZ_QUESTIONS : [];
        if (!qs.length) {
            console.warn('[daily] no questions loaded');
            return;
        }

        var stamp = todayStamp();
        var todayQs = pickToday(stamp, qs, 5);
        var state = loadState(stamp);

        // Date hero
        var dateEl = document.getElementById('daily-date');
        if (dateEl) dateEl.textContent = prettyDate(stamp);

        var diffEl = document.getElementById('daily-difficulty');
        if (diffEl) diffEl.textContent = 'DIFFICULTY: ' + difficultyLabel(todayQs);

        var countEl = document.getElementById('daily-count');
        if (countEl) countEl.textContent = todayQs.length + ' QUESTIONS';

        // Cards
        var container = document.getElementById('daily-questions');
        if (!container) return;
        container.innerHTML = todayQs.map(function (q, i) { return renderCard(q, i, state); }).join('');

        // Wire up each card
        todayQs.forEach(function (q) {
            var qid = q.id;
            var input    = document.getElementById('q-' + qid + '-input');
            var checkBtn = document.getElementById('q-' + qid + '-check');
            var skipBtn  = document.getElementById('q-' + qid + '-skip');
            var feedback = document.getElementById('q-' + qid + '-feedback');
            var card     = document.querySelector('.daily-q-card[data-qid="' + qid + '"]');

            if (!checkBtn || !input || !feedback) return;

            checkBtn.addEventListener('click', function () {
                var userAns = input.value;
                var expected = (q.answer && q.answer.text) || q.answer_text || '';
                var ok = isCorrect(userAns, expected);

                state[qid] = {
                    answer: userAns,
                    correct: ok,
                    attempts: ((state[qid] && state[qid].attempts) || 0) + 1,
                    ts: Date.now()
                };
                saveState(stamp, state);

                feedback.classList.remove('hidden', 'text-[#00c853]', 'text-secondary');
                if (ok) {
                    feedback.classList.add('text-[#00c853]');
                    feedback.textContent = '✓ CORRECT — ' + expected;
                    input.disabled = true;
                    if (card) card.style.borderColor = '#00c853';
                } else {
                    feedback.classList.add('text-secondary');
                    feedback.textContent = '✗ INCORRECT';
                    if (card) {
                        card.style.transition = 'transform .08s';
                        card.style.transform = 'translateX(-6px)';
                        setTimeout(function () { card.style.transform = 'translateX(6px)'; }, 80);
                        setTimeout(function () { card.style.transform = ''; }, 160);
                    }
                }
                updateProgress();
            });

            skipBtn.addEventListener('click', function () {
                state[qid] = { answer: '', correct: null, attempts: ((state[qid] && state[qid].attempts) || 0), skipped: true, ts: Date.now() };
                saveState(stamp, state);
                feedback.classList.remove('hidden', 'text-[#00c853]');
                feedback.classList.add('text-on-surface-variant');
                feedback.textContent = '— SKIPPED';
                updateProgress();
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') checkBtn.click();
            });
        });

        // Progress + streak
        function updateProgress() {
            var answered = 0, correct = 0;
            todayQs.forEach(function (q) {
                var s = state[q.id];
                if (s && (s.correct === true || s.correct === false || s.skipped)) answered++;
                if (s && s.correct === true) correct++;
            });
            var prog = document.getElementById('daily-progress');
            if (prog) prog.textContent = answered + ' / ' + todayQs.length + ' ANSWERED';

            var scoreEl = document.getElementById('daily-score');
            if (scoreEl) scoreEl.textContent = correct + ' / ' + todayQs.length;

            // Update day streak when fully answered
            if (answered === todayQs.length) {
                try {
                    var lastDay = localStorage.getItem('qv_last_daily');
                    var streak = parseInt(localStorage.getItem('qv_day_streak') || '0', 10);
                    if (lastDay !== stamp) {
                        // Check if yesterday was completed → increment, else reset to 1
                        var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                        var ystamp = yesterday.toISOString().slice(0, 10);
                        if (lastDay === ystamp) streak += 1;
                        else streak = 1;
                        localStorage.setItem('qv_day_streak', String(streak));
                        localStorage.setItem('qv_last_daily', stamp);
                    }
                } catch (e) { /* ignore */ }
            }
        }
        updateProgress();

        // Finalize button (just refreshes UI + shows score)
        var finalize = document.getElementById('daily-finalize');
        if (finalize) {
            finalize.addEventListener('click', function () {
                updateProgress();
                var done = todayQs.every(function (q) {
                    var s = state[q.id];
                    return s && (s.correct === true || s.correct === false || s.skipped);
                });
                if (!done) {
                    finalize.textContent = 'ANSWER ALL FIRST';
                    setTimeout(function () { finalize.textContent = 'FINALIZE_SUBMISSION'; }, 1500);
                    return;
                }
                var correct = todayQs.filter(function (q) { return (state[q.id] || {}).correct === true; }).length;
                finalize.textContent = 'DONE — ' + correct + '/' + todayQs.length;
                finalize.disabled = true;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
