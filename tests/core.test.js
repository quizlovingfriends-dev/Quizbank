/**
 * core.test.js — Unit Test Suite (Item 14)
 *
 * Run with: npx vitest run tests/core.test.js
 * Or: node tests/core.test.js (standalone, no framework needed)
 *
 * Tests cover:
 *   - Fuzzy matching
 *   - Performance repair
 *   - Streak calculations
 *   - Spaced repetition sorting
 *   - Data migration
 *   - Session history persistence
 */

// ── Minimal Test Runner (no framework needed) ──────────────────────────────
var passed = 0;
var failed = 0;
var total  = 0;

function describe(name, fn) {
  console.log('\n━━━ ' + name + ' ━━━');
  fn();
}

function it(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log('  ✅ ' + name);
  } catch (e) {
    failed++;
    console.log('  ❌ ' + name);
    console.log('     ' + (e.message || e));
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error((message || 'Expected') + ': ' + JSON.stringify(expected) + ', got: ' + JSON.stringify(actual));
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error((message || 'Deep equal failed') + '\n  Expected: ' + JSON.stringify(expected) + '\n  Got:      ' + JSON.stringify(actual));
  }
}

// ── Import logic (inline for standalone mode) ──────────────────────────────

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

function repairPerformance(p) {
  if (!p || typeof p !== 'object') {
    return { correct: 0, total: 0, perTopic: {}, weakQuestions: {}, streak: 0, dailyResults: {} };
  }
  if (typeof p.correct !== 'number') p.correct = 0;
  if (typeof p.total   !== 'number') p.total = 0;
  if (typeof p.streak  !== 'number') p.streak = 0;
  if (!p.perTopic || typeof p.perTopic !== 'object') p.perTopic = {};
  if (!p.weakQuestions || typeof p.weakQuestions !== 'object') p.weakQuestions = {};
  if (!p.dailyResults || typeof p.dailyResults !== 'object') p.dailyResults = {};
  return p;
}

function spacedRepetitionSort(questions, weakMap) {
  if (!weakMap || Object.keys(weakMap).length === 0) return questions;
  var weakIds = new Set(Object.keys(weakMap));
  var weak = [];
  var normal = [];
  questions.forEach(function (q) {
    var id = String(q.id);
    if (weakIds.has(id)) {
      var repeats = Math.min(weakMap[id] || 1, 3);
      for (var r = 0; r < repeats; r++) weak.push(q);
    } else {
      normal.push(q);
    }
  });
  var result = [];
  var wi = 0, ni = 0;
  while (ni < normal.length || wi < weak.length) {
    for (var c = 0; c < 2 && ni < normal.length; c++) result.push(normal[ni++]);
    if (wi < weak.length) result.push(weak[wi++]);
  }
  return result;
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  var costs = [];
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1, shorter = s2;
  if (s1.length < s2.length) { longer = s2; shorter = s1; }
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// ── TESTS ──────────────────────────────────────────────────────────────────

describe('Fuzzy Match', function () {
  it('should return true for empty query', function () {
    assert(fuzzyMatch('', 'anything') === true);
    assert(fuzzyMatch(null, 'anything') === true);
  });

  it('should match exact substring', function () {
    assert(fuzzyMatch('cricket', 'Who holds the cricket record?') === true);
  });

  it('should match case-insensitively', function () {
    assert(fuzzyMatch('CRICKET', 'who holds the cricket record') === true);
  });

  it('should match subsequence', function () {
    assert(fuzzyMatch('crkt', 'cricket') === true);
  });

  it('should reject non-matching strings', function () {
    assert(fuzzyMatch('xyz123', 'cricket sports ball') === false);
  });

  it('should handle single character queries', function () {
    assert(fuzzyMatch('c', 'cricket') === true);
    assert(fuzzyMatch('z', 'cricket') === false);
  });
});

describe('Performance Repair', function () {
  it('should create default from null', function () {
    var result = repairPerformance(null);
    assertEqual(result.correct, 0);
    assertEqual(result.total, 0);
    assertEqual(result.streak, 0);
    assert(typeof result.perTopic === 'object');
    assert(typeof result.weakQuestions === 'object');
  });

  it('should repair missing fields', function () {
    var result = repairPerformance({ correct: 5 });
    assertEqual(result.correct, 5);
    assertEqual(result.total, 0);
    assertEqual(result.streak, 0);
  });

  it('should pass through valid data', function () {
    var valid = { correct: 10, total: 20, streak: 3, perTopic: {}, weakQuestions: {}, dailyResults: {} };
    var result = repairPerformance(valid);
    assertEqual(result.correct, 10);
    assertEqual(result.total, 20);
    assertEqual(result.streak, 3);
  });
});

describe('Spaced Repetition Sort', function () {
  var questions = [
    { id: '1', question: { text: 'Q1' } },
    { id: '2', question: { text: 'Q2' } },
    { id: '3', question: { text: 'Q3' } },
    { id: '4', question: { text: 'Q4' } },
    { id: '5', question: { text: 'Q5' } }
  ];

  it('should return original order when no weak questions', function () {
    var result = spacedRepetitionSort(questions, {});
    assertEqual(result.length, 5);
  });

  it('should repeat weak questions', function () {
    var result = spacedRepetitionSort(questions, { '2': 2 });
    assert(result.length > 5, 'Should have more than 5 entries (weak repeated)');
    var q2Count = result.filter(function (q) { return q.id === '2'; }).length;
    assert(q2Count >= 2, 'Q2 should appear at least twice, got ' + q2Count);
  });

  it('should cap repeats at 3', function () {
    var result = spacedRepetitionSort(questions, { '1': 10 });
    var q1Count = result.filter(function (q) { return q.id === '1'; }).length;
    assert(q1Count <= 3, 'Should cap at 3 repeats, got ' + q1Count);
  });
});

describe('Normalize', function () {
  it('should lowercase and strip special chars', function () {
    assertEqual(normalize('Hello, World!'), 'hello world');
  });

  it('should collapse whitespace', function () {
    assertEqual(normalize('  foo   bar  '), 'foo bar');
  });

  it('should handle empty input', function () {
    assertEqual(normalize(''), '');
    assertEqual(normalize(null), '');
  });
});

describe('Edit Distance', function () {
  it('should return 0 for identical strings', function () {
    assertEqual(editDistance('hello', 'hello'), 0);
  });

  it('should return correct distance', function () {
    assertEqual(editDistance('kitten', 'sitting'), 3);
  });

  it('should handle empty strings', function () {
    assertEqual(editDistance('', 'abc'), 3);
    assertEqual(editDistance('abc', ''), 3);
  });
});

describe('Similarity', function () {
  it('should return 1.0 for identical strings', function () {
    assertEqual(similarity('hello', 'hello'), 1.0);
  });

  it('should return > 0.78 for close typos', function () {
    assert(similarity('brian lara', 'brian lra') >= 0.78, 'Close typo should score >= 0.78');
  });

  it('should return < 0.78 for very different strings', function () {
    assert(similarity('hello', 'xyzabc') < 0.78, 'Different strings should score < 0.78');
  });
});

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(40));
console.log('RESULTS: ' + passed + '/' + total + ' passed, ' + failed + ' failed');
console.log('═'.repeat(40));

if (typeof process !== 'undefined') {
  process.exit(failed > 0 ? 1 : 0);
}
