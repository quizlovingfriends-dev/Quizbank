/**
 * six-pile.js — Render and drive the 6-tile category game.
 *
 * DOM contract:
 *   #six-pile-stage — root container; this script fills it.
 *
 * URL params:
 *   ?qid=1001  — play a specific question
 *   (no param) — random pick from SIX_PILE_QUESTIONS
 */
(function () {
    'use strict';

    function getQuestions() {
        return (typeof SIX_PILE_QUESTIONS !== 'undefined') ? SIX_PILE_QUESTIONS.slice() : [];
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function recordOutcome(qid, score, max) {
        try {
            var key = 'qv_sixpile_state';
            var s = JSON.parse(localStorage.getItem(key) || '{}');
            var entry = s[qid] || { plays: 0, best: 0 };
            entry.plays += 1;
            if (score > entry.best) entry.best = score;
            entry.lastScore = score;
            entry.max = max;
            entry.lastPlayed = Date.now();
            s[qid] = entry;
            localStorage.setItem(key, JSON.stringify(s));
        } catch (e) {}
    }

    function renderGame(question) {
        var stage = document.getElementById('six-pile-stage');
        if (!stage) return;

        var tiles = shuffle(question.tiles);
        var maxScore = question.tiles.filter(function (t) { return t.correct; }).length;
        var state = { score: 0, picked: 0, ended: false };

        var tilesHtml = tiles.map(function (tile, i) {
            return (
                '<button class="six-pile-tile" data-idx="' + i + '" data-correct="' + (tile.correct ? '1' : '0') + '">' +
                    '<div class="tile-inner">' +
                        '<div class="tile-front">' +
                            '<div class="tile-num">' + String(i + 1).padStart(2, '0') + '</div>' +
                            '<div class="tile-label">' + escapeHtml(tile.label) + '</div>' +
                        '</div>' +
                        '<div class="tile-back">' +
                            '<div class="tile-verdict"></div>' +
                            '<div class="tile-label">' + escapeHtml(tile.label) + '</div>' +
                        '</div>' +
                    '</div>' +
                '</button>'
            );
        }).join('');

        stage.innerHTML =
            '<div class="six-pile-wrap">' +
                '<header class="six-pile-header">' +
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">SIX-PILE // CATEGORY ROUND</div>' +
                    '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' +
                        escapeHtml(question.category) +
                    '</h1>' +
                    '<p class="font-body-md text-body-md text-on-surface-variant mt-2">' +
                        'Pick the right ones. +1 per correct. First wrong pick ends the round.' +
                    '</p>' +
                '</header>' +
                '<div class="six-pile-scorebar">' +
                    '<div><span class="sb-label">SCORE</span><span class="sb-value" id="sp-score">0</span></div>' +
                    '<div><span class="sb-label">PICKED</span><span class="sb-value"><span id="sp-picked">0</span>/6</span></div>' +
                    '<div><span class="sb-label">MAX</span><span class="sb-value">' + maxScore + '</span></div>' +
                '</div>' +
                '<div class="six-pile-grid">' + tilesHtml + '</div>' +
                '<div id="sp-result" class="six-pile-result" style="display:none;"></div>' +
            '</div>';

        // Wire tile clicks
        var tilesEls = stage.querySelectorAll('.six-pile-tile');
        tilesEls.forEach(function (el) {
            el.addEventListener('click', function () {
                if (state.ended) return;
                if (el.classList.contains('flipped')) return;

                var isCorrect = el.dataset.correct === '1';
                el.classList.add('flipped');
                el.querySelector('.tile-verdict').textContent = isCorrect ? '✓' : '✗';
                el.classList.add(isCorrect ? 'correct' : 'wrong');

                state.picked += 1;
                document.getElementById('sp-picked').textContent = state.picked;

                if (isCorrect) {
                    state.score += 1;
                    document.getElementById('sp-score').textContent = state.score;
                    if (state.score >= maxScore) {
                        endRound(question, state, maxScore, true);
                    }
                } else {
                    endRound(question, state, maxScore, false);
                }
            });
        });
    }

    function endRound(question, state, maxScore, swept) {
        state.ended = true;
        // Reveal everything
        document.querySelectorAll('.six-pile-tile').forEach(function (el) {
            if (!el.classList.contains('flipped')) {
                el.classList.add('flipped', 'revealed');
                var isCorrect = el.dataset.correct === '1';
                el.querySelector('.tile-verdict').textContent = isCorrect ? '✓' : '✗';
                el.classList.add(isCorrect ? 'correct' : 'wrong');
                el.style.opacity = '.55';
            }
        });

        recordOutcome(question.id, state.score, maxScore);

        var verdict;
        if (swept)                    verdict = 'PERFECT SWEEP';
        else if (state.score === 0)   verdict = 'OUT ON THE FIRST PICK';
        else if (state.score >= maxScore - 1) verdict = 'JUST SHORT';
        else if (state.score >= maxScore / 2) verdict = 'RESPECTABLE';
        else                          verdict = 'NEEDS PRACTICE';

        var result = document.getElementById('sp-result');
        result.style.display = 'block';
        result.innerHTML =
            '<div class="result-inner">' +
                '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">ROUND OVER</div>' +
                '<div class="result-score">' + state.score + ' / ' + maxScore + '</div>' +
                '<div class="font-section-label text-section-label uppercase mt-2 text-secondary">' + verdict + '</div>' +
                (question.funda ?
                    '<div class="result-funda"><strong>FUNDA</strong>' + escapeHtml(question.funda) + '</div>' : '') +
                '<div class="result-buttons">' +
                    '<button class="bg-secondary text-on-secondary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow" onclick="window.location.reload()">PLAY AGAIN</button>' +
                    '<a href="index.html" class="bg-transparent text-primary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow text-center">BACK TO BASE</a>' +
                '</div>' +
            '</div>';
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function pickQuestion() {
        var params = new URLSearchParams(window.location.search);
        var requested = parseInt(params.get('qid') || '0', 10);
        var qs = getQuestions();
        if (!qs.length) return null;
        if (requested) {
            var match = qs.filter(function (q) { return q.id === requested; })[0];
            if (match) return match;
        }
        return qs[Math.floor(Math.random() * qs.length)];
    }

    function init() {
        var q = pickQuestion();
        if (!q) {
            var stage = document.getElementById('six-pile-stage');
            if (stage) stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary mb-4">NO QUESTIONS</div><div class="font-body-md text-body-md">No 6-pile questions are loaded yet.</div></div>';
            return;
        }
        renderGame(q);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
