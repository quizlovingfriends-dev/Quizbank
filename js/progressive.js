/**
 * progressive.js — Progressive reveal questions.
 *
 * Source: QUIZ_QUESTIONS where type === 'progressive'. These questions have
 * multi-part answers ("which 5 continents, and what do colours represent").
 * UX: show the question + image, user thinks, clicks "REVEAL PART 1",
 * we split the answer text into sentences and reveal them one at a time.
 * Each click awards 1 point if the user said "I knew it" before reveal;
 * scoring is self-graded.
 *
 * DOM:
 *   #progressive-stage  — root container; this script fills it.
 *   #progressive-list   — index list of all progressive rounds.
 *
 * URL params:
 *   ?qid=3   — play a specific question
 *   (no qid) — index list
 */
(function () {
    'use strict';

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }
    function stripHtml(s) { return (s || '').replace(/<[^>]+>/g, ''); }

    // Split answer text into bite-sized parts (sentences, then chunks ~12 words)
    function splitParts(answerText) {
        var t = stripHtml(answerText || '').trim();
        if (!t) return [];
        // First split on sentence terminators
        var sents = t.split(/(?<=[.!?])\s+/).filter(function (s) { return s.trim().length > 0; });
        // If only one sentence but it's long, split on " and " or ", "
        if (sents.length === 1 && sents[0].length > 100) {
            sents = sents[0].split(/\s+and\s+|,\s+/i);
        }
        return sents.map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function getRounds() {
        if (typeof QUIZ_QUESTIONS === 'undefined') return [];
        return QUIZ_QUESTIONS.filter(function (q) { return q.type === 'progressive'; });
    }

    function getProgress(qid) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_progressive_state') || '{}');
            return s[qid] || null;
        } catch (e) { return null; }
    }
    function recordProgress(qid, knew, total) {
        try {
            var key = 'qv_progressive_state';
            var s = JSON.parse(localStorage.getItem(key) || '{}');
            var entry = s[qid] || { plays: 0, best: 0, total: 0 };
            entry.plays += 1;
            if (knew > entry.best) entry.best = knew;
            entry.total = total;
            entry.lastPlayed = Date.now();
            s[qid] = entry;
            localStorage.setItem(key, JSON.stringify(s));
        } catch (e) {}
    }

    // ---------------- Index list ----------------
    function renderIndex(rounds) {
        var stage = document.getElementById('progressive-stage');
        if (!stage) return;

        if (!rounds.length) {
            stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary mb-4">NO ROUNDS</div></div>';
            return;
        }

        var cardsHtml = rounds.map(function (q) {
            var parts = splitParts((q.answer || {}).text || '');
            var best = getProgress(q.id);
            var bestText = best ? (best.best + ' / ' + parts.length) : ('— / ' + parts.length);
            var qText = stripHtml((q.question || {}).text || '');
            var preview = qText.length > 140 ? qText.substring(0, 140) + '…' : qText;
            return (
                '<a href="progressive.html?qid=' + q.id + '" ' +
                   'class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">Q.' + String(q.id).padStart(3, '0') + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((q.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' +
                        escapeHtml(preview) +
                    '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' +
                        parts.length + ' parts to discover' +
                    '</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">BEST: ' + bestText + '</div>' +
                '</a>'
            );
        }).join('');

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // PROGRESSIVE</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">PROGRESSIVE REVEAL</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">' +
                    'Multi-part questions. Read the question, think of the full answer, then reveal the answer ' +
                    'one part at a time. Mark each part as <strong>KNEW IT</strong> or <strong>MISSED</strong>. ' +
                    rounds.length + ' rounds.' +
                '</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cardsHtml + '</div>';
    }

    // ---------------- Game render ----------------
    function renderGame(q) {
        var stage = document.getElementById('progressive-stage');
        if (!stage) return;

        var qText = stripHtml((q.question || {}).text || '');
        var qImage = (q.question || {}).image || null;
        var parts = splitParts((q.answer || {}).text || '');
        var state = { revealed: 0, knew: 0, parts: parts };

        var imageHtml = '';
        if (qImage && typeof qImage === 'string') {
            imageHtml =
                '<div class="border-[3px] border-black bg-surface-container hard-shadow my-6" style="aspect-ratio:21/9;overflow:hidden;max-width:640px;">' +
                    '<img src="' + escapeHtml(qImage) + '" alt="Question image" ' +
                         'style="width:100%;height:100%;object-fit:cover;display:block;" ' +
                         'onerror="this.parentNode.style.display=\'none\'">' +
                '</div>';
        }

        var partsHtml = parts.map(function (p, i) {
            return (
                '<div class="prog-part" data-idx="' + i + '" style="display:none;">' +
                    '<div class="prog-part-head">' +
                        '<span class="prog-part-num">PART ' + String(i + 1).padStart(2, '0') + ' / ' + String(parts.length).padStart(2, '0') + '</span>' +
                    '</div>' +
                    '<div class="prog-part-body">' + escapeHtml(p) + '</div>' +
                    '<div class="prog-part-buttons">' +
                        '<button class="prog-knew" data-idx="' + i + '">KNEW IT (+1)</button>' +
                        '<button class="prog-missed" data-idx="' + i + '">MISSED</button>' +
                    '</div>' +
                '</div>'
            );
        }).join('');

        stage.innerHTML =
            '<div class="prog-wrap">' +
                '<header class="prog-header">' +
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROGRESSIVE // Q.' + String(q.id).padStart(3, '0') + ' · ' + escapeHtml((q.topic || 'GENERAL').toUpperCase()) + '</div>' +
                    '<h1 class="font-headline-lg-mobile md:text-[40px] font-black text-primary uppercase tracking-tighter leading-[1.1] mt-3">' +
                        escapeHtml(qText) +
                    '</h1>' +
                    imageHtml +
                '</header>' +
                '<div class="prog-scorebar">' +
                    '<div><span class="sb-label">KNEW</span><span class="sb-value" id="prog-knew-count">0</span></div>' +
                    '<div><span class="sb-label">REVEALED</span><span class="sb-value"><span id="prog-revealed">0</span>/' + parts.length + '</span></div>' +
                    '<div><span class="sb-label">PARTS</span><span class="sb-value">' + parts.length + '</span></div>' +
                '</div>' +
                '<div id="prog-parts" class="prog-parts">' + partsHtml + '</div>' +
                '<button id="prog-reveal-next" class="prog-cta">REVEAL FIRST PART ↓</button>' +
                '<div id="prog-result" style="display:none;"></div>' +
                '<div class="mt-6"><a href="progressive.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>' +
            '</div>';

        var revealBtn = document.getElementById('prog-reveal-next');
        revealBtn.addEventListener('click', function () { revealNext(); });

        function revealNext() {
            if (state.revealed >= parts.length) return;
            var div = stage.querySelector('.prog-part[data-idx="' + state.revealed + '"]');
            if (div) div.style.display = 'block';
            state.revealed += 1;
            document.getElementById('prog-revealed').textContent = state.revealed;
            if (state.revealed === parts.length) {
                revealBtn.style.display = 'none';
            } else {
                revealBtn.textContent = 'REVEAL PART ' + String(state.revealed + 1).padStart(2, '0') + ' ↓';
            }
        }

        // Wire knew/missed buttons (event delegation)
        document.getElementById('prog-parts').addEventListener('click', function (e) {
            var t = e.target;
            if (!t) return;
            var idx = parseInt(t.dataset.idx, 10);
            if (isNaN(idx)) return;
            if (t.classList.contains('prog-knew')) {
                state.knew += 1;
                document.getElementById('prog-knew-count').textContent = state.knew;
                t.parentNode.parentNode.classList.add('marked-knew');
                t.parentNode.parentNode.querySelector('.prog-knew').disabled = true;
                t.parentNode.parentNode.querySelector('.prog-missed').disabled = true;
            } else if (t.classList.contains('prog-missed')) {
                t.parentNode.parentNode.classList.add('marked-missed');
                t.parentNode.parentNode.querySelector('.prog-knew').disabled = true;
                t.parentNode.parentNode.querySelector('.prog-missed').disabled = true;
            }
            if (state.revealed === parts.length) {
                // Check if all parts marked
                var allMarked = parts.every(function (_, i) {
                    var d = stage.querySelector('.prog-part[data-idx="' + i + '"]');
                    return d && (d.classList.contains('marked-knew') || d.classList.contains('marked-missed'));
                });
                if (allMarked) endRound(q, state);
            }
        });
    }

    function endRound(q, state) {
        recordProgress(q.id, state.knew, state.parts.length);
        var pct = state.parts.length ? Math.round((state.knew / state.parts.length) * 100) : 0;
        var verdict = pct === 100 ? 'TOTAL RECALL' : pct >= 75 ? 'STRONG' : pct >= 50 ? 'PARTIAL' : pct >= 25 ? 'WEAK SPOTS' : 'BLIND SPOT';

        var fundaText = stripHtml((q.funda || {}).text || '');

        var result = document.getElementById('prog-result');
        result.style.display = 'block';
        result.innerHTML =
            '<div class="prog-result-card">' +
                '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">ROUND OVER</div>' +
                '<div class="prog-result-score">' + state.knew + ' / ' + state.parts.length + '</div>' +
                '<div class="font-section-label text-section-label uppercase mt-2" style="color:#fa1e4e;">' + verdict + '</div>' +
                (fundaText ?
                    '<div class="prog-result-funda"><strong>FUNDA</strong>' + escapeHtml(fundaText) + '</div>' : '') +
                '<div class="prog-result-buttons">' +
                    '<button class="bg-secondary text-on-secondary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow" onclick="window.location.reload()">PLAY AGAIN</button>' +
                    '<a href="progressive.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:#fff;">NEXT ROUND →</a>' +
                '</div>' +
            '</div>';
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function init() {
        var rounds = getRounds();
        var params = new URLSearchParams(window.location.search);
        var qid = parseInt(params.get('qid') || '0', 10);
        if (qid) {
            var match = rounds.filter(function (r) { return r.id === qid; })[0];
            if (match) { renderGame(match); return; }
        }
        renderIndex(rounds);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
