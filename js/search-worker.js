/**
 * search-worker.js — Web Worker for Fuzzy Search (Item 6)
 *
 * Offloads the fuzzy-search algorithm to a background thread
 * so the UI stays responsive on large datasets.
 *
 * Messages:
 *   IN:  { type: 'SEARCH', query: string, questions: Question[] }
 *   OUT: { type: 'RESULTS', results: Question[] }
 */

self.onmessage = function (e) {
  var msg = e.data;

  if (msg.type === 'SEARCH') {
    var query = (msg.query || '').toLowerCase().trim();
    var questions = msg.questions || [];
    var filter = msg.filter || 'all';
    var difficulty = msg.difficulty || 'all';

    var results = questions.filter(function (q) {
      if (filter !== 'all' && q.topic !== filter) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (query) {
        var target = (q.question.text + ' ' + q.answer.text + ' ' + (q.funda ? q.funda.text : ''));
        if (!fuzzyMatch(query, target)) return false;
      }
      return true;
    });

    self.postMessage({ type: 'RESULTS', results: results });
  }
};

function fuzzyMatch(query, target) {
  if (!query) return true;
  var q = query.toLowerCase().trim();
  var t = target.toLowerCase();
  if (t.includes(q)) return true;
  var qIdx = 0;
  for (var i = 0; i < t.length; i++) {
    if (t[i] === q[qIdx]) qIdx++;
    if (qIdx === q.length) return true;
  }
  return false;
}
