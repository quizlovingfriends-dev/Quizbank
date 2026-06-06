/**
 * sanitizer.js — Tiny XSS-safe HTML sanitizer for question/answer/funda text.
 *
 * Allows these tags only:  <strong>, <b>, <em>, <i>, <br>, <mark>, <sup>, <sub>
 * Strips everything else (including all event handlers, scripts, iframes).
 *
 * Loaded BEFORE state.js / questionbank.js / quiz-card.js. Exposes window.QV.sanitize().
 */
(function() {
  var ALLOWED_TAGS = { STRONG:1, B:1, EM:1, I:1, BR:1, MARK:1, SUP:1, SUB:1 };

  function sanitize(html) {
    if (html == null) return '';
    if (typeof html !== 'string') html = String(html);

    // Parse into a detached DOM tree
    var doc = new DOMParser().parseFromString('<div id="root">' + html + '</div>', 'text/html');
    var root = doc.getElementById('root');
    if (!root) return '';

    // Walk and strip disallowed tags / all attributes
    walk(root);

    return root.innerHTML;
  }

  function walk(node) {
    var child = node.firstChild;
    while (child) {
      var next = child.nextSibling;
      if (child.nodeType === 1) { // ELEMENT_NODE
        if (!ALLOWED_TAGS[child.tagName]) {
          // Disallowed: replace with its text content (kills <script>, <img>, <iframe>, ...)
          var text = document.createTextNode(child.textContent || '');
          child.parentNode.replaceChild(text, child);
        } else {
          // Allowed tag — strip ALL attributes (no href, no onclick, etc.)
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          walk(child);
        }
      }
      // Text nodes are kept as-is (they're already safe)
      child = next;
    }
  }

  // Plain-text only (for places where no formatting is wanted)
  function plain(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  window.QV = window.QV || {};
  window.QV.sanitize = sanitize;
  window.QV.plain    = plain;
})();
