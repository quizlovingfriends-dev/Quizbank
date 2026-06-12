/**
 * sequence.js — Arrange items in correct order by clicking them one at a time.
 *
 * Reads from window.SEQUENCE_QUESTIONS + QUIZ_QUESTIONS[type==='sequence'].
 * DOM: #sequence-stage    URL: ?qid=2301
 *
 * UX: User clicks tiles in the order they think is right. Each click slides
 * the tile into a sequence row at the bottom. Submit checks if all positions
 * match. Score = number correct in place.
 */
(function () {
    'use strict';
    function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }

    function getRounds() {
        var rounds = (typeof SEQUENCE_QUESTIONS !== 'undefined') ? SEQUENCE_QUESTIONS.slice() : [];
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            QUIZ_QUESTIONS.forEach(function (q) { if (q.type === 'sequence') rounds.push(q); });
        }
        return rounds;
    }
    function getBest(qid) { try { return (JSON.parse(localStorage.getItem('qv_seq_state') || '{}'))[qid]; } catch (e) { return null; } }
    function record(qid, score, max) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_seq_state') || '{}');
            var e = s[qid] || { plays: 0, best: 0 };
            e.plays += 1; if (score > e.best) e.best = score;
            e.max = max; e.lastPlayed = Date.now();
            s[qid] = e; localStorage.setItem('qv_seq_state', JSON.stringify(s));
        } catch (err) {}
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    function renderIndex(rounds) {
        var stage = document.getElementById('sequence-stage');
        if (!stage) return;
        if (!rounds.length) { stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary">NO ROUNDS</div></div>'; return; }
        var cards = rounds.map(function (r) {
            var best = getBest(r.id);
            return (
                '<a href="sequence.html?qid=' + r.id + '" class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">SEQUENCE // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' + escapeHtml(r.prompt) + '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' + r.items.length + ' items</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">BEST: ' + (best ? best.best + ' / ' + r.items.length : '— / ' + r.items.length) + '</div>' +
                '</a>'
            );
        }).join('');
        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // SEQUENCE</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">PUT THEM IN ORDER</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">Click items in the order you think is right. ' + rounds.length + ' rounds.</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cards + '</div>';
    }

    function renderGame(r) {
        var stage = document.getElementById('sequence-stage');
        if (!stage) return;
        var pool = shuffle(r.items);
        var picked = [];

        function tilesHtml() {
            return pool.map(function (it, i) {
                var inUse = picked.some(function (p) { return p.label === it.label; });
                return (
                    '<button class="seq-tile border-[3px] border-black hard-shadow p-4 text-left ' +
                        (inUse ? 'opacity-30 cursor-not-allowed' : '') + '" ' +
                        'data-label="' + escapeHtml(it.label) + '" ' + (inUse ? 'disabled' : '') + '>' +
                        '<div class="font-section-label text-section-label uppercase text-on-surface-variant">ITEM ' + String(i + 1).padStart(2, '0') + '</div>' +
                        '<div class="font-headline-lg-mobile font-black uppercase mt-1">' + escapeHtml(it.label) + '</div>' +
                    '</button>'
                );
            }).join('');
        }

        function pickedHtml() {
            var slots = [];
            for (var i = 0; i < r.items.length; i++) {
                var p = picked[i];
                slots.push(
                    '<div class="seq-slot border-[3px] border-black ' + (p ? 'bg-primary text-on-primary' : 'bg-surface-container border-dashed') + ' p-4 flex items-center gap-4">' +
                        '<span class="font-section-label text-section-label uppercase" style="font-size:24px;letter-spacing:0;">' + String(i + 1).padStart(2, '0') + '</span>' +
                        '<span class="font-headline-lg-mobile font-black uppercase">' + (p ? escapeHtml(p.label) : '—') + '</span>' +
                    '</div>'
                );
            }
            return slots.join('');
        }

        function paint() {
            document.getElementById('seq-tiles').innerHTML = tilesHtml();
            document.getElementById('seq-slots').innerHTML = pickedHtml();
            wireTiles();
            document.getElementById('seq-submit').disabled = picked.length !== r.items.length;
            document.getElementById('seq-clear').disabled = picked.length === 0;
        }

        function wireTiles() {
            document.querySelectorAll('.seq-tile').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    if (picked.length >= r.items.length) return;
                    var lbl = btn.dataset.label;
                    var src = pool.filter(function (it) { return it.label === lbl; })[0];
                    if (!src) return;
                    if (picked.some(function (p) { return p.label === lbl; })) return;
                    picked.push(src);
                    paint();
                });
            });
        }

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-4 mb-6">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">SEQUENCE // ROUND #' + r.id + ' · ' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' + escapeHtml(r.prompt) + '</h1>' +
            '</header>' +
            '<div class="font-section-label text-section-label uppercase mb-2">PICK FROM:</div>' +
            '<div id="seq-tiles" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"></div>' +
            '<div class="font-section-label text-section-label uppercase mb-2">YOUR ORDER:</div>' +
            '<div id="seq-slots" class="flex flex-col gap-3 mb-6"></div>' +
            '<div class="flex flex-col md:flex-row gap-3">' +
                '<button id="seq-submit" class="flex-1 bg-secondary text-on-secondary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow" disabled>SUBMIT</button>' +
                '<button id="seq-clear"  class="flex-1 bg-transparent text-primary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow" disabled>CLEAR</button>' +
            '</div>' +
            '<div id="seq-result" class="mt-6" style="display:none;"></div>' +
            '<div class="mt-6"><a href="sequence.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>';

        paint();

        document.getElementById('seq-clear').addEventListener('click', function () { picked = []; paint(); });

        document.getElementById('seq-submit').addEventListener('click', function () {
            var score = 0;
            picked.forEach(function (p, i) {
                if (p.order === i + 1) score++;
            });
            record(r.id, score, r.items.length);
            var perfect = score === r.items.length;
            var result = document.getElementById('seq-result');
            // Show the right order
            var correctOrder = r.items.slice().sort(function (a, b) { return a.order - b.order; });
            var correctList = correctOrder.map(function (it, i) {
                return '<div class="font-body-md text-[15px]"><strong>' + (i + 1) + '.</strong> ' + escapeHtml(it.label) + '</div>';
            }).join('');
            result.style.display = 'block';
            result.innerHTML =
                '<div class="border-[3px] border-black ' + (perfect ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary') + ' hard-shadow p-8">' +
                    '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">' + (perfect ? 'PERFECT ORDER' : 'PARTIAL') + '</div>' +
                    '<div class="font-hero-display text-[64px] font-black leading-none">' + score + ' / ' + r.items.length + '</div>' +
                    '<div class="mt-6 p-4 border-2 border-white/30">' +
                        '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">CORRECT ORDER</div>' + correctList +
                    '</div>' +
                    (r.funda ? '<div class="mt-4 p-4 border-2 border-white/30 text-[14px] leading-relaxed">' + escapeHtml(r.funda) + '</div>' : '') +
                    '<div class="flex flex-col md:flex-row gap-3 mt-6">' +
                        '<button class="bg-white text-black px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black" onclick="window.location.reload()">PLAY AGAIN</button>' +
                        '<a href="sequence.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:inherit;">NEXT ROUND →</a>' +
                    '</div>' +
                '</div>';
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
