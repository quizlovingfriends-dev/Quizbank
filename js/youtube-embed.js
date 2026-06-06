/**
 * youtube-embed.js — Detect YouTube URLs in question text and render embeds.
 *
 * Exposes:
 *   QV.youtube.extractId(text)   — returns video ID or null
 *   QV.youtube.embedHTML(id)     — returns iframe HTML for a video ID
 *   QV.youtube.processText(text) — returns { cleanedText, embedHTML } —
 *                                  text with URL stripped, plus iframe if found
 *
 * Handles:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://m.youtube.com/...
 *   - OCR-mangled URLs with spaces (best-effort, returns null if too broken)
 */
(function() {
  // Strict pattern — clean URLs only. Captures 11-char video ID.
  const YOUTUBE_RE = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

  // Loose pattern — detects "youtube" mention even if URL is broken by OCR.
  const YOUTUBE_LOOSE_RE = /(?:youtube|youtu\.be)/i;

  function extractId(text) {
    if (!text) return null;
    const m = text.match(YOUTUBE_RE);
    return m ? m[1] : null;
  }

  function hasMention(text) {
    if (!text) return false;
    return YOUTUBE_LOOSE_RE.test(text);
  }

  function embedHTML(videoId) {
    if (!videoId) return '';
    // Sanitize — only allow expected ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return '';
    return ''
      + '<div class="yt-embed-wrap" style="position:relative;padding-bottom:56.25%;height:0;margin:16px 0;border:3px solid var(--ink);background:#000;">'
      +   '<iframe '
      +     'src="https://www.youtube.com/embed/' + videoId + '" '
      +     'style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" '
      +     'title="Embedded YouTube video" '
      +     'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" '
      +     'allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin">'
      +   '</iframe>'
      + '</div>';
  }

  /**
   * Process question text: extract the URL, return cleaned text + embed HTML.
   * If a clean YT URL is found → strip it from text, return iframe to render after.
   * If only OCR-mangled "youtube" mention is found → return text as-is + a notice.
   */
  function processText(text) {
    if (!text) return { cleanedText: '', embedHTML: '', missingVideo: false };

    const id = extractId(text);
    if (id) {
      // Strip the URL from the displayed text (we'll show the embed instead)
      const cleaned = text.replace(YOUTUBE_RE, '').replace(/\s{2,}/g, ' ').trim();
      return {
        cleanedText: cleaned,
        embedHTML: embedHTML(id),
        missingVideo: false,
      };
    }

    if (hasMention(text)) {
      // YouTube was mentioned but the URL is too broken (OCR damage) to recover
      return {
        cleanedText: text,
        embedHTML: '',
        missingVideo: true,
      };
    }

    return { cleanedText: text, embedHTML: '', missingVideo: false };
  }

  function missingVideoNotice() {
    return ''
      + '<div style="margin:12px 0;padding:10px 14px;border:2px dashed var(--ink);background:rgba(255,200,200,0.3);font-size:11px;letter-spacing:1px;">'
      +   '⚠ VIDEO_LINK_DAMAGED // ORIGINAL_YOUTUBE_URL_LOST_IN_OCR'
      + '</div>';
  }

  window.QV = window.QV || {};
  window.QV.youtube = {
    extractId: extractId,
    hasMention: hasMention,
    embedHTML: embedHTML,
    processText: processText,
    missingVideoNotice: missingVideoNotice,
  };
})();
