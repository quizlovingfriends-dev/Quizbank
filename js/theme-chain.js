/**
 * theme-chain.js — Engine for theme-game and anagram-chain question types.
 *
 * Both types share a structure:
 *   q.chain = [ { q: '...', a: '...' }, ... ]
 *   q.theme = '...'                      // the meta-answer
 *   q.answer.text = canonical theme answer
 *
 * UX: One mini-question revealed at a time. User clicks REVEAL ANSWER →
 * marks SELF-graded knew it / missed → next mini-question appears.
 * After all chain items answered, the THEME REVEAL panel shows.
 *
 * DOM: #theme-stage   URL: ?qid=71
 */
(function () {
    'use strict';

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }
    function stripHtml(s) { return (s || '').replace(/<[^>]+>/g, ''); }

    function getRounds() {
        if (typeof QUIZ_QUESTIONS === 'undefined') return [];
        return QUIZ_QUESTIONS.filter(function (q) {
            return (q.type === 'theme-game' || q.type === 'anagram-chain') && Array.isArray(q.chain);
        });
    }

    function getBest(qid) {
        try { return (JSON.parse(localStorage.getItem('qv_theme_state') || '{}'))[qid]; }
        catch (e) { return null; }
    }
    function record(qid, knew, total, gotTheme) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_theme_state') || '{}');
            var e = s[qid] || { plays: 0, best: 0, themeGot: 0 };
            e.plays += 1;
            if (knew > e.best) e.best = knew;
            if (gotTheme) e.themeGot += 1;
            e.lastPlayed = Date.now();
            s[qid] = e;
            localStorage.setItem('qv_theme_state', JSON.stringify(s));
        } catch (err) {}
    }

    function renderIndex(rounds) {
        var stage = document.getElementById('theme-stage');
        if (!stage) return;
        if (!rounds.length) {
            stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary">NO ROUNDS</div></div>';
            return;
        }
        var cards = rounds.map(function (r) {
            var best = getBest(r.id);
            var typeLabel = r.type === 'anagram-chain' ? 'ANAGRAM' : 'THEME';
            var bestText = best ? (best.best + ' / ' + r.chain.length) : ('— / ' + r.chain.length);
            return (
                '<a href="theme.html?qid=' + r.id + '" class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">' + typeLabel + ' // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-body-md text-[15px] leading-relaxed text-primary font-bold">' + escapeHtml(r.theme || (r.question || {}).text || '') + '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' + r.chain.length + ' mini-questions</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">BEST: ' + bestText + '</div>' +
                '</a>'
            );
        }).join('');
        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // THEME &amp; ANAGRAM</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">THEMED CHAINS</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">' +
                    'Answer the mini-questions in order, then guess the connecting theme — or in anagram rounds, ' +
                    'spell out the meta-answer from each answer\'s first letter.' +
                '</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cards + '</div>';
    }

    function renderGame(r) {
        var stage = document.getElementById('theme-stage');
        if (!stage) return;
        var state = { idx: 0, knew: 0 };
        var totalParts = r.chain.length;

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-4 mb-6">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">' +
                    (r.type === 'anagram-chain' ? 'ANAGRAM CHAIN' : 'THEME GAME') + ' // ROUND #' + r.id + ' · ' + escapeHtml((r.topic || 'GENERAL').toUpperCase()) +
                '</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' +
                    escapeHtml(r.theme ? 'CHAIN HAS A HIDDEN THEME' : 'Find the theme') +
                '</h1>' +
            '</header>' +
            '<div class="theme-scorebar">' +
                '<div><span class="sb-label">KNEW</span><span class="sb-value" id="theme-knew">0</span></div>' +
                '<div><span class="sb-label">PART</span><span class="sb-value"><span id="theme-idx">1</span>/' + totalParts + '</span></div>' +
                '<div><span class="sb-label">CHAIN</span><span class="sb-value">' + totalParts + '</span></div>' +
            '</div>' +
            '<div id="theme-parts" class="theme-parts"></div>' +
            '<div id="theme-reveal" style="display:none;"></div>' +
            '<div class="mt-6"><a href="theme.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>';

        function renderPart() {
            if (state.idx >= totalParts) { revealTheme(); return; }
            var item = r.chain[state.idx];
            var div = document.createElement('div');
            div.className = 'theme-part';
            div.innerHTML =
                '<div class="theme-part-head">' +
                    '<span class="theme-part-num">PART ' + String(state.idx + 1).padStart(2, '0') + ' / ' + String(totalParts).padStart(2, '0') + '</span>' +
                '</div>' +
                '<div class="theme-part-body">' + escapeHtml(item.q) + '</div>' +
                '<div class="theme-part-answer" style="display:none;">' +
                    '<div class="theme-answer-label">ANSWER</div>' +
                    '<div class="theme-answer-text">' + escapeHtml(item.a) + '</div>' +
                '</div>' +
                '<div class="theme-part-buttons">' +
                    '<button class="t-reveal">REVEAL ANSWER ↓</button>' +
                '</div>';
            document.getElementById('theme-parts').appendChild(div);

            var revealBtn = div.querySelector('.t-reveal');
            revealBtn.addEventListener('click', function () {
                div.querySelector('.theme-part-answer').style.display = 'block';
                revealBtn.parentNode.innerHTML =
                    '<button class="t-knew">KNEW IT (+1)</button>' +
                    '<button class="t-missed">MISSED</button>';
                div.querySelector('.t-knew').addEventListener('click', function () { mark(div, true); });
                div.querySelector('.t-missed').addEventListener('click', function () { mark(div, false); });
            });
        }

        function mark(div, knew) {
            div.classList.add(knew ? 'marked-knew' : 'marked-missed');
            div.querySelectorAll('.theme-part-buttons button').forEach(function (b) { b.disabled = true; });
            if (knew) {
                state.knew += 1;
                document.getElementById('theme-knew').textContent = state.knew;
            }
            state.idx += 1;
            document.getElementById('theme-idx').textContent = Math.min(state.idx + 1, totalParts);
            setTimeout(renderPart, 200);
        }

        function revealTheme() {
            var rev = document.getElementById('theme-reveal');
            var answerText = (r.answer && r.answer.text) || r.theme || '—';
            rev.style.display = 'block';
            rev.innerHTML =
                '<div class="theme-reveal-card">' +
                    '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">CHAIN COMPLETE</div>' +
                    '<div class="theme-score">' + state.knew + ' / ' + totalParts + '</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-4 opacity-70">THE THEME</div>' +
                    '<div class="theme-reveal-answer">' + escapeHtml(answerText) + '</div>' +
                    (r.theme && r.theme !== answerText ? '<div class="theme-reveal-hint">' + escapeHtml(r.theme) + '</div>' : '') +
                    ((r.funda || {}).text ? '<div class="theme-result-funda"><strong>FUNDA</strong>' + escapeHtml(stripHtml(r.funda.text)) + '</div>' : '') +
                    '<div class="theme-result-buttons">' +
                        '<button class="bg-white text-black px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black" onclick="window.location.reload()">PLAY AGAIN</button>' +
                        '<a href="theme.html" class="bg-transparent px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="color:#fff;">NEXT ROUND →</a>' +
                    '</div>' +
                '</div>';
            record(r.id, state.knew, totalParts, true);
            rev.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        renderPart();
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
