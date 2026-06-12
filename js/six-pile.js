/**
 * six-pile.js — Render and drive the 6-tile category game.
 *
 * Reads from QUIZ_QUESTIONS (questions.js) where type === 'grid-flip'.
 * Each grid-flip question has its category + tiles encoded into question.text
 * as a single string like:
 *    "CATEGORY TITLE  Item1 - RIGHT  Item2 - WRONG  Item3 - RIGHT  ..."
 * We parse it into structured form on load.
 *
 * Falls back to SIX_PILE_QUESTIONS (data/six-pile.js) if present, for any
 * manually-authored entries.
 *
 * DOM contract:
 *   #six-pile-stage  — root container; this script fills it.
 *   #six-pile-list   — optional list container; shows all available rounds.
 *
 * URL params:
 *   ?qid=37  — play a specific question
 *   (no qid) — show index list
 */
(function () {
    'use strict';

    // ------------------------------------------------------------
    // Parser: convert grid-flip question text into {category, tiles}
    // ------------------------------------------------------------
    function parseGridFlipText(rawText, fallbackTopic) {
        var text = (rawText || '').replace(/\s+/g, ' ').trim();
        if (!text) return null;

        // Find "Word - RIGHT" or "Word - WRONG" patterns
        // Greedy on the label side, but stops at " - RIGHT/WRONG"
        var tileRe = /([^-]+?)\s*-\s*(RIGHT|WRONG)/gi;
        var tiles = [];
        var match;
        var lastEnd = 0;
        var firstStart = -1;
        while ((match = tileRe.exec(text)) !== null) {
            var label = match[1].trim();
            // The label may have absorbed the trailing word of a previous "WRONG" / "RIGHT"
            // e.g., "RIGHT Biriyani" — strip leading RIGHT/WRONG and any preceding category word
            label = label.replace(/^(RIGHT|WRONG)\s+/i, '').trim();
            if (label.length === 0) continue;
            if (firstStart === -1) firstStart = match.index;
            tiles.push({
                label: label,
                correct: match[2].toUpperCase() === 'RIGHT'
            });
            lastEnd = tileRe.lastIndex;
        }

        if (tiles.length < 2) return null;  // not a usable round

        // Category = everything before the first tile pattern
        var category = '';
        if (firstStart > 0) {
            category = text.substring(0, firstStart).trim();
            // Strip the prefix-word that became the first tile's prefix
            // (handled above by stripping ^RIGHT|WRONG)
        }
        if (!category) category = '(Category)';

        // De-dup tiles (same label may appear in two rounds merged)
        var seen = {};
        var deduped = [];
        for (var i = 0; i < tiles.length; i++) {
            var k = tiles[i].label.toLowerCase();
            if (!seen[k]) { seen[k] = true; deduped.push(tiles[i]); }
        }
        return { category: category, tiles: deduped };
    }

    function loadRounds() {
        var rounds = [];
        // From questions.js (live data)
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            QUIZ_QUESTIONS.forEach(function (q) {
                if (q.type !== 'grid-flip') return;

                // Prefer structured tiles[] (new canonical schema)
                if (Array.isArray(q.tiles) && q.tiles.length >= 4) {
                    rounds.push({
                        id: q.id,
                        topic: q.topic || 'general',
                        category: q.category || (q.question || {}).text || 'Category',
                        tiles: q.tiles,
                        funda: (q.funda || {}).text || ''
                    });
                    return;
                }

                // Legacy fallback: parse messy OCR string in question.text
                var parsed = parseGridFlipText((q.question || {}).text || '', q.topic);
                if (!parsed) return;
                if (parsed.tiles.length < 4) return;
                rounds.push({
                    id: q.id,
                    topic: q.topic || 'general',
                    category: parsed.category,
                    tiles: parsed.tiles,
                    funda: (q.funda || {}).text || ''
                });
            });
        }
        // From data/six-pile.js if present (manually-authored)
        if (typeof SIX_PILE_QUESTIONS !== 'undefined') {
            SIX_PILE_QUESTIONS.forEach(function (q) {
                rounds.push({
                    id: q.id,
                    topic: q.topic || 'general',
                    category: q.category,
                    tiles: q.tiles,
                    funda: q.funda || ''
                });
            });
        }
        return rounds;
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
        });
    }
    function stripHtml(s) {
        return (s || '').replace(/<[^>]+>/g, '');
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
            entry.lastScore = score; entry.max = max; entry.lastPlayed = Date.now();
            s[qid] = entry;
            localStorage.setItem(key, JSON.stringify(s));
        } catch (e) {}
    }
    function getBest(qid) {
        try {
            var s = JSON.parse(localStorage.getItem('qv_sixpile_state') || '{}');
            return s[qid] || null;
        } catch (e) { return null; }
    }

    // ------------------------------------------------------------
    // Index list
    // ------------------------------------------------------------
    function renderIndex(rounds) {
        var stage = document.getElementById('six-pile-stage');
        if (!stage) return;

        if (!rounds.length) {
            stage.innerHTML = '<div class="border-[3px] border-dashed border-black p-12 text-center"><div class="font-section-label text-section-label uppercase text-secondary mb-4">NO ROUNDS</div><div class="font-body-md text-body-md">No grid-flip questions found in the vault.</div></div>';
            return;
        }

        var cardsHtml = rounds.map(function (r) {
            var best = getBest(r.id);
            var maxScore = r.tiles.filter(function (t) { return t.correct; }).length;
            var bestText = best ? (best.best + ' / ' + maxScore) : ('— / ' + maxScore);
            return (
                '<a href="six-pile.html?qid=' + r.id + '" ' +
                   'class="bg-surface border-[3px] border-black hard-shadow p-6 flex flex-col gap-3 no-underline">' +
                    '<div class="flex justify-between items-baseline">' +
                        '<span class="font-section-label text-section-label uppercase text-on-surface-variant">ROUND // ' + r.id + '</span>' +
                        '<span class="font-section-label text-section-label uppercase" style="background:#0024d9;color:#fff;padding:3px 8px;">' + escapeHtml(r.topic.toUpperCase()) + '</span>' +
                    '</div>' +
                    '<div class="font-headline-lg-mobile font-black uppercase tracking-tighter text-primary">' +
                        escapeHtml(r.category) +
                    '</div>' +
                    '<div class="font-body-md text-body-md text-on-surface-variant">' +
                        r.tiles.length + ' tiles · max ' + maxScore +
                    '</div>' +
                    '<div class="font-section-label text-section-label uppercase mt-auto">BEST: ' + bestText + '</div>' +
                '</a>'
            );
        }).join('');

        stage.innerHTML =
            '<header class="border-b-[3px] border-black pb-6 mb-8">' +
                '<div class="font-section-label text-section-label uppercase text-on-surface-variant">PROTOCOL // SIX-PILE</div>' +
                '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">CATEGORY ROUNDS</h1>' +
                '<p class="font-body-md text-body-md text-on-surface-variant mt-4 max-w-2xl">' +
                    'Pick the right ones in a category. <strong>+1 per correct</strong>. First wrong pick ends the round. ' +
                    rounds.length + ' rounds available.' +
                '</p>' +
            '</header>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">' + cardsHtml + '</div>';
    }

    // ------------------------------------------------------------
    // Game render
    // ------------------------------------------------------------
    function renderGame(round) {
        var stage = document.getElementById('six-pile-stage');
        if (!stage) return;

        var tiles = shuffle(round.tiles);
        var maxScore = round.tiles.filter(function (t) { return t.correct; }).length;
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
                    '<div class="font-section-label text-section-label uppercase text-on-surface-variant">SIX-PILE // CATEGORY ROUND #' + round.id + '</div>' +
                    '<h1 class="font-headline-lg-mobile md:font-headline-lg font-black uppercase tracking-tighter mt-2">' +
                        escapeHtml(round.category) +
                    '</h1>' +
                    '<p class="font-body-md text-body-md text-on-surface-variant mt-2">' +
                        'Pick the right ones. +1 per correct. First wrong pick ends the round.' +
                    '</p>' +
                '</header>' +
                '<div class="six-pile-scorebar">' +
                    '<div><span class="sb-label">SCORE</span><span class="sb-value" id="sp-score">0</span></div>' +
                    '<div><span class="sb-label">PICKED</span><span class="sb-value"><span id="sp-picked">0</span>/' + round.tiles.length + '</span></div>' +
                    '<div><span class="sb-label">MAX</span><span class="sb-value">' + maxScore + '</span></div>' +
                '</div>' +
                '<div class="six-pile-grid">' + tilesHtml + '</div>' +
                '<div id="sp-result" class="six-pile-result" style="display:none;"></div>' +
                '<div class="mt-4"><a href="six-pile.html" class="font-section-label text-section-label uppercase hover:text-secondary">← ALL ROUNDS</a></div>' +
            '</div>';

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
                    if (state.score >= maxScore) endRound(round, state, maxScore, true);
                } else {
                    endRound(round, state, maxScore, false);
                }
            });
        });
    }

    function endRound(round, state, maxScore, swept) {
        state.ended = true;
        document.querySelectorAll('.six-pile-tile').forEach(function (el) {
            if (!el.classList.contains('flipped')) {
                el.classList.add('flipped', 'revealed');
                var isCorrect = el.dataset.correct === '1';
                el.querySelector('.tile-verdict').textContent = isCorrect ? '✓' : '✗';
                el.classList.add(isCorrect ? 'correct' : 'wrong');
                el.style.opacity = '.55';
            }
        });

        recordOutcome(round.id, state.score, maxScore);

        var verdict;
        if (swept)                            verdict = 'PERFECT SWEEP';
        else if (state.score === 0)           verdict = 'OUT ON THE FIRST PICK';
        else if (state.score >= maxScore - 1) verdict = 'JUST SHORT';
        else if (state.score >= maxScore / 2) verdict = 'RESPECTABLE';
        else                                  verdict = 'NEEDS PRACTICE';

        var result = document.getElementById('sp-result');
        result.style.display = 'block';
        result.innerHTML =
            '<div class="result-inner">' +
                '<div class="font-section-label text-section-label uppercase opacity-70 mb-2">ROUND OVER</div>' +
                '<div class="result-score">' + state.score + ' / ' + maxScore + '</div>' +
                '<div class="font-section-label text-section-label uppercase mt-2 text-secondary">' + verdict + '</div>' +
                (round.funda ?
                    '<div class="result-funda"><strong>FUNDA</strong>' + escapeHtml(stripHtml(round.funda)) + '</div>' : '') +
                '<div class="result-buttons">' +
                    '<button class="bg-secondary text-on-secondary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-black hard-shadow" onclick="window.location.reload()">PLAY AGAIN</button>' +
                    '<a href="six-pile.html" class="bg-transparent text-on-primary px-6 py-4 font-ui-button text-ui-button uppercase border-[3px] border-white text-center" style="background:transparent;color:#fff;">NEXT ROUND →</a>' +
                '</div>' +
            '</div>';
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ------------------------------------------------------------
    // Entry
    // ------------------------------------------------------------
    function init() {
        var rounds = loadRounds();
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
