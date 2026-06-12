/**
 * mcq.js — Multiple choice questions (4 options).
 *
 * Reads from window.MCQ_QUESTIONS + QUIZ_QUESTIONS[type==='mcq'].
 * DOM: #mcq-stage    URL: ?qid=2201
 */
(function () {
    'use strict';
    function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }

    function getRounds() {
        var rounds = (typeof MCQ_QUESTIONS !== 'undefined') ? MCQ_QUESTIONS.slice() : [];
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            QUIZ_QUESTIONS.forEach(function (q) { if (q.type === 'mcq') rounds.push(q); });
        }
        return rounds;
    }
    function getBest(qid) { try { return (JSON.parse(localStorage.getItem('qv_mcq_state') || '{}'))[qid]; } catch (e) { return null; } }
    function record(qid, ok) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_mcq_state') || '{}');
            var e = s[qid] || { plays: 0, wins: 0 };
            e.plays += 1; if (ok) e.wins += 1; e.lastPlayed = Date.now();
            s[qid] = e; localStorage.setItem('qv_mcq_state', JSON.stringify(s));
        } catch (err) {}
    }

    function renderIndex(rounds) {
        var stage = document.getElementById('mcq-stage');
        if (!stage) return;
        if (!rounds.length) { stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary">NO ROUNDS</div></div>'; return; }
        var cards = rounds.map(function (r) {
            var best = getBest(r.id);
            var winRate = best ? (Math.round((best.wins / best.plays) * 100) + '%') : '—';
            return (
                '<a href="mcq.html?qid=' + r.id + '" class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">MCQ // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' + escapeHtml(r.question) + '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' + r.options.length + ' options</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">WIN RATE: ' + winRate + '</div>' +
                '</a>'
            );
        }).join('');
        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // MULTIPLE CHOICE</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">MULTIPLE CHOICE</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">Pick one of four. ' + rounds.length + ' rounds.</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cards + '</div>';
    }

    function renderGame(r) {
        var stage = document.getElementById('mcq-stage');
        if (!stage) return;
        var ended = false;

        var opts = r.options.map(function (opt, i) {
            var letter = String.fromCharCode(65 + i);
            return (
                '<button class="mcq-option border-[3px] border-black bg-surface hard-shadow p-5 flex items-center gap-4 text-left" data-idx="' + i + '">' +
                    '<span class="font-section-label text-section-label uppercase text-secondary" style="font-size:24px;letter-spacing:0;">' + letter + '</span>' +
                    '<span class="font-body-md text-[17px] font-bold text-primary">' + escapeHtml(opt) + '</span>' +
                '</button>'
            );
        }).join('');

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-4 mb-6">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">MCQ // ROUND #' + r.id + ' · ' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' + escapeHtml(r.question) + '</h1>' +
            '</header>' +
            '<div class="flex flex-col gap-3 mb-6">' + opts + '</div>' +
            '<div id="mcq-result" style="display:none;"></div>' +
            '<div class="mt-6"><a href="mcq.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>';

        stage.querySelectorAll('.mcq-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (ended) return;
                ended = true;
                var picked = parseInt(btn.dataset.idx, 10);
                var ok = picked === r.correctIndex;
                record(r.id, ok);
                stage.querySelectorAll('.mcq-option').forEach(function (b) {
                    var idx = parseInt(b.dataset.idx, 10);
                    if (idx === r.correctIndex) { b.style.background = '#00c853'; b.style.color = '#000'; }
                    else if (b === btn && !ok)   { b.style.background = '#ba0034'; b.style.color = '#fff'; }
                });
                var result = document.getElementById('mcq-result');
                result.style.display = 'block';
                result.innerHTML =
                    '<div class="border-[3px] border-black ' + (ok ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary') + ' hard-shadow p-8">' +
                        '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">' + (ok ? 'CORRECT' : 'INCORRECT') + '</div>' +
                        '<div class="font-hero-display text-[48px] font-black leading-none">' + escapeHtml(r.options[r.correctIndex]) + '</div>' +
                        (r.funda ? '<div class="mt-4 p-4 border-2 border-white/30 text-[14px] leading-relaxed">' + escapeHtml(r.funda) + '</div>' : '') +
                        '<div class="flex flex-col md:flex-row gap-3 mt-6">' +
                            '<button class="bg-white text-black px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black" onclick="window.location.reload()">PLAY AGAIN</button>' +
                            '<a href="mcq.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:inherit;">NEXT ROUND →</a>' +
                        '</div>' +
                    '</div>';
            });
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
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
