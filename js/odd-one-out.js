/**
 * odd-one-out.js — N items, one doesn't fit. Pick it.
 *
 * Reads from window.ODD_ONE_OUT_QUESTIONS + QUIZ_QUESTIONS[type==='odd-one-out'].
 * DOM: #odd-stage    URL: ?qid=2101
 */
(function () {
    'use strict';
    function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }

    function getRounds() {
        var rounds = (typeof ODD_ONE_OUT_QUESTIONS !== 'undefined') ? ODD_ONE_OUT_QUESTIONS.slice() : [];
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            QUIZ_QUESTIONS.forEach(function (q) { if (q.type === 'odd-one-out') rounds.push(q); });
        }
        return rounds;
    }
    function getBest(qid) {
        try { return (JSON.parse(localStorage.getItem('qv_odd_state') || '{}'))[qid]; } catch (e) { return null; }
    }
    function record(qid, gotIt) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_odd_state') || '{}');
            var e = s[qid] || { plays: 0, wins: 0 };
            e.plays += 1; if (gotIt) e.wins += 1;
            e.lastPlayed = Date.now(); s[qid] = e;
            localStorage.setItem('qv_odd_state', JSON.stringify(s));
        } catch (err) {}
    }

    function renderIndex(rounds) {
        var stage = document.getElementById('odd-stage');
        if (!stage) return;
        if (!rounds.length) { stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary">NO ROUNDS</div></div>'; return; }
        var cards = rounds.map(function (r) {
            var best = getBest(r.id);
            var winRate = best ? (Math.round((best.wins / best.plays) * 100) + '%') : '—';
            return (
                '<a href="odd-one-out.html?qid=' + r.id + '" class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">ODD-ONE-OUT // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' + escapeHtml(r.prompt) + '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' + r.items.length + ' items</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">WIN RATE: ' + winRate + '</div>' +
                '</a>'
            );
        }).join('');
        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // ODD-ONE-OUT</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">ODD ONE OUT</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">N items. One doesn\'t fit. Pick it. ' + rounds.length + ' rounds.</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cards + '</div>';
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    function renderGame(r) {
        var stage = document.getElementById('odd-stage');
        if (!stage) return;
        var items = shuffle(r.items);
        var ended = false;

        var tilesHtml = items.map(function (it, i) {
            return (
                '<button class="odd-tile border-[3px] border-black bg-surface hard-shadow p-6 text-left flex flex-col gap-2" data-label="' + escapeHtml(it) + '">' +
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">' + String(i + 1).padStart(2, '0') + '</div>' +
                    '<div class="font-headline-lg-mobile font-black uppercase tracking-tighter">' + escapeHtml(it) + '</div>' +
                '</button>'
            );
        }).join('');

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-4 mb-6">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">ODD-ONE-OUT // ROUND #' + r.id + ' · ' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' + escapeHtml(r.prompt) + '</h1>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-6">' + tilesHtml + '</div>' +
            '<div id="odd-result" style="display:none;"></div>' +
            '<div class="mt-6"><a href="odd-one-out.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>';

        stage.querySelectorAll('.odd-tile').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (ended) return;
                ended = true;
                var picked = btn.dataset.label;
                var correct = picked === r.odd;
                record(r.id, correct);
                stage.querySelectorAll('.odd-tile').forEach(function (b) {
                    var lbl = b.dataset.label;
                    if (lbl === r.odd) { b.style.background = '#00c853'; b.style.color = '#000'; }
                    else if (b === btn && !correct) { b.style.background = '#ba0034'; b.style.color = '#fff'; }
                });
                var result = document.getElementById('odd-result');
                result.style.display = 'block';
                result.innerHTML =
                    '<div class="border-[3px] border-black ' + (correct ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary') + ' hard-shadow p-8">' +
                        '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">' + (correct ? 'CORRECT' : 'INCORRECT') + '</div>' +
                        '<div class="font-hero-display text-[48px] font-black leading-none">' + escapeHtml(r.odd) + '</div>' +
                        (r.funda ? '<div class="mt-4 p-4 border-2 border-white/30 text-[14px] leading-relaxed">' + escapeHtml(r.funda) + '</div>' : '') +
                        '<div class="flex flex-col md:flex-row gap-3 mt-6">' +
                            '<button class="bg-white text-black px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black" onclick="window.location.reload()">PLAY AGAIN</button>' +
                            '<a href="odd-one-out.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:inherit;">NEXT ROUND →</a>' +
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
