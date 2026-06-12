/**
 * connect.js — 3 clues, one common link.
 *
 * UX: reveal clues one at a time. The earlier you guess, the more points.
 *   - Guess after 1st clue: 6 points
 *   - Guess after 2nd clue: 4 points
 *   - Guess after 3rd clue: 2 points
 *   - Miss all: 0
 *
 * Reads from window.CONNECT_QUESTIONS + QUIZ_QUESTIONS where type==='connect'.
 *
 * DOM: #connect-stage  (fills with index or game)
 * URL: ?qid=2001
 */
(function () {
    'use strict';

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }
    function normalize(s) {
        return (s || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    }
    function isMatch(u, e) {
        var nu = normalize(u), ne = normalize(e);
        if (!nu || !ne) return false;
        if (nu === ne) return true;
        if (ne.indexOf(nu) !== -1 && nu.length >= 3) return true;
        if (nu.indexOf(ne) !== -1) return true;
        // Last-name match: "gandhi" matches "mahatma gandhi"
        var eLast = ne.split(' ').pop();
        if (eLast.length >= 4 && nu === eLast) return true;
        return false;
    }

    function getRounds() {
        var rounds = (typeof CONNECT_QUESTIONS !== 'undefined') ? CONNECT_QUESTIONS.slice() : [];
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            QUIZ_QUESTIONS.forEach(function (q) {
                if (q.type === 'connect') rounds.push(q);
            });
        }
        return rounds;
    }

    function getBest(qid) {
        try { return (JSON.parse(localStorage.getItem('qv_connect_state') || '{}'))[qid]; }
        catch (e) { return null; }
    }
    function recordOutcome(qid, score) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_connect_state') || '{}');
            var e = s[qid] || { plays: 0, best: 0 };
            e.plays += 1;
            if (score > e.best) e.best = score;
            e.lastScore = score; e.lastPlayed = Date.now();
            s[qid] = e;
            localStorage.setItem('qv_connect_state', JSON.stringify(s));
        } catch (err) {}
    }

    function renderIndex(rounds) {
        var stage = document.getElementById('connect-stage');
        if (!stage) return;
        if (!rounds.length) {
            stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary mb-4">NO ROUNDS</div></div>';
            return;
        }
        var cardsHtml = rounds.map(function (r) {
            var best = getBest(r.id);
            return (
                '<a href="connect.html?qid=' + r.id + '" class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">CONNECT // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' + escapeHtml(r.clues[0]) + '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' + r.clues.length + ' clues · max 6 pts</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">BEST: ' + (best ? best.best : '—') + ' / 6</div>' +
                '</a>'
            );
        }).join('');
        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // CONNECT</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">CONNECT THE CLUES</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">' +
                    'Three clues, one common link. Guess after clue 1 for <strong>6 pts</strong>, clue 2 for <strong>4 pts</strong>, clue 3 for <strong>2 pts</strong>. ' +
                    rounds.length + ' rounds.' +
                '</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cardsHtml + '</div>';
    }

    function renderGame(r) {
        var stage = document.getElementById('connect-stage');
        if (!stage) return;
        var state = { revealed: 1, ended: false };
        var possibleScores = [6, 4, 2];

        stage.innerHTML =
            '<div class="connect-wrap">' +
                '<header class="border-b-[3px] border-black pb-4 mb-6">' +
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">CONNECT // ROUND #' + r.id + ' · ' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</div>' +
                    '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">WHAT CONNECTS THESE?</h1>' +
                '</header>' +
                '<div id="connect-clues" class="flex flex-col gap-4 mb-6"></div>' +
                '<div class="flex flex-col gap-3 mb-6">' +
                    '<label class="font-section-label text-section-label uppercase" for="connect-input">YOUR ANSWER (Worth ' +
                        '<span id="connect-points">' + possibleScores[0] + '</span> pts)</label>' +
                    '<input id="connect-input" type="text" autocomplete="off" placeholder="TYPE THE COMMON LINK" ' +
                           'class="w-full border-[3px] border-black bg-surface-container p-4 font-body-md text-[16px] uppercase text-primary focus:bg-white focus:outline-none hard-shadow">' +
                '</div>' +
                '<div class="flex flex-col md:flex-row gap-3">' +
                    '<button id="connect-guess" class="flex-1 bg-secondary text-on-secondary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow">GUESS NOW</button>' +
                    '<button id="connect-next-clue" class="flex-1 bg-transparent text-primary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow">NEXT CLUE ↓</button>' +
                '</div>' +
                '<div id="connect-result" class="mt-6" style="display:none;"></div>' +
                '<div class="mt-6"><a href="connect.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>' +
            '</div>';

        var cluesEl = document.getElementById('connect-clues');
        var revealClues = function () {
            cluesEl.innerHTML = '';
            for (var i = 0; i < state.revealed; i++) {
                cluesEl.insertAdjacentHTML('beforeend',
                    '<div class="connect-clue border-[3px] border-black bg-surface p-5 hard-shadow">' +
                        '<div class="font-section-label text-section-label uppercase text-secondary mb-2">CLUE 0' + (i + 1) + '</div>' +
                        '<div class="font-body-md text-[17px] leading-relaxed font-bold">' + escapeHtml(r.clues[i]) + '</div>' +
                    '</div>');
            }
            var pointsEl = document.getElementById('connect-points');
            if (pointsEl) pointsEl.textContent = possibleScores[state.revealed - 1] || 0;
        };
        revealClues();

        var input = document.getElementById('connect-input');
        var nextBtn = document.getElementById('connect-next-clue');
        var guessBtn = document.getElementById('connect-guess');

        function endRound(correct, score) {
            state.ended = true;
            input.disabled = true; guessBtn.disabled = true; nextBtn.disabled = true;
            recordOutcome(r.id, score);
            var result = document.getElementById('connect-result');
            result.style.display = 'block';
            result.innerHTML =
                '<div class="border-[3px] border-black ' + (correct ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary') + ' hard-shadow p-8">' +
                    '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">' + (correct ? 'CORRECT' : 'INCORRECT') + '</div>' +
                    '<div class="font-hero-display text-[64px] md:text-[96px] font-black leading-none">' + score + ' / 6</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-4">ANSWER: ' + escapeHtml(r.answer) + '</div>' +
                    (r.funda ? '<div class="mt-4 p-4 border-2 border-white/30 text-[14px] leading-relaxed">' + escapeHtml(r.funda) + '</div>' : '') +
                    '<div class="flex flex-col md:flex-row gap-3 mt-6">' +
                        '<button class="bg-white text-black px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black" onclick="window.location.reload()">PLAY AGAIN</button>' +
                        '<a href="connect.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:inherit;">NEXT ROUND →</a>' +
                    '</div>' +
                '</div>';
        }

        guessBtn.addEventListener('click', function () {
            if (state.ended) return;
            var score = possibleScores[state.revealed - 1] || 0;
            var ok = isMatch(input.value, r.answer);
            endRound(ok, ok ? score : 0);
        });
        nextBtn.addEventListener('click', function () {
            if (state.ended) return;
            if (state.revealed >= r.clues.length) {
                endRound(false, 0); return;
            }
            state.revealed += 1;
            revealClues();
            if (state.revealed >= r.clues.length) nextBtn.textContent = 'OUT OF CLUES — GUESS NOW';
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') guessBtn.click();
        });
    }

    function init() {
        var rounds = getRounds();
        var qid = parseInt(new URLSearchParams(window.location.search).get('qid') || '0', 10);
        if (qid) {
            var m = rounds.filter(function (r) { return r.id === qid; })[0];
            if (m) { renderGame(m); return; }
        }
        renderIndex(rounds);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
