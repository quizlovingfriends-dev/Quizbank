/**
 * quiz-card.js - Native Web Component for QuizVault
 */

(function() {
  class QuizCard extends HTMLElement {
    constructor() {
      super();
    }

    setData(q, index, options) {
      this.q = q;
      this.index = index;
      this.options = options || {};
      this.render();
    }

    highlight(text, query) {
      if (!query || query.trim().length < 2) return text;
      try {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="highlight">$1</mark>');
      } catch(e) { return text; }
    }

    render() {
      if (!this.q) return;

      const q = this.q;
      const index = this.index;
      const query = this.options.highlightQuery || '';
      const sanitize = (window.QV && window.QV.sanitize) || function(s) { return s; };

      const qRaw   = sanitize(q.question.text);
      const aRaw   = sanitize(q.answer.text);
      const fRaw   = sanitize((q.funda && q.funda.text) ? q.funda.text : '');

      // YouTube auto-embed: detect YT URL in question text → strip URL, render iframe
      const yt = (window.QV && window.QV.youtube)
        ? window.QV.youtube.processText(qRaw)
        : { cleanedText: qRaw, embedHTML: '', missingVideo: false };

      const qText = this.highlight(yt.cleanedText, query);
      const aText = this.highlight(aRaw, query);
      const fText = this.highlight(fRaw, query);
      const qEmbedHtml = yt.embedHTML ||
        (yt.missingVideo ? window.QV.youtube.missingVideoNotice() : '');

      const isFav   = (window.state && state.isFavorite(q.id));
      const isSaved = (window.state && state.isSavedToWiki(q.id));
      
      const diffClass = `q-${q.difficulty || 'easy'}`;

      // Pre-build question image HTML
      let qImgHtml = '';
      if (q.question.images && q.question.images.length > 0) {
        qImgHtml = `<div style="display:flex; gap:16px; margin-top:16px; flex-wrap:wrap;">` + 
          q.question.images.map(img => `<img src="${img}" class="question-image" loading="lazy" decoding="async" alt="Question image" style="max-height:250px; max-width:100%; border:3px solid var(--ink); display:block;" onerror="this.style.display='none'">`).join('') + 
          `</div>`;
      } else if (q.question.image) {
        qImgHtml = `<img src="${q.question.image}" class="question-image" loading="lazy" decoding="async" alt="Question image" style="max-width:100%; border:3px solid var(--ink); margin-top:16px; display:block;" onerror="this.style.display='none'">`;
      }

      this.innerHTML = `
        <article class="question-card ${diffClass}" id="q-${q.id}">
            <div class="card-header">
                <span class="card-num">Q.${String(index + 1).padStart(3, '0')}</span>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="share-btn" title="SHARE_LINK" aria-label="Share question">↗</button>
                    <button class="wiki-btn ${isSaved ? 'active' : ''}" title="SAVE_TO_WIKI" aria-label="Save question to wiki">${isSaved ? 'SAVED' : 'SAVE_TO_WIKI'}</button>
                    <button class="fav-btn ${isFav ? 'active' : ''}" title="FAVORITE" aria-label="Favorite question">${isFav ? 'FAVORITE' : 'FAVORITE'}</button>
                    <span class="topic-badge">${q.topic.toUpperCase()}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="question-text">${qText}</div>
                ${qEmbedHtml}
                ${qImgHtml}
                <button class="reveal-btn">REVEAL ANSWER</button>
            </div>
            <div class="answer-section">
                <div class="answer-inner">
                    <div class="answer-block">
                        <strong>ANSWER</strong>
                        <div class="answer-text">${aText}</div>
                        <div class="answer-image-container"></div>
                    </div>
                    ${fText ? `
                    <div class="answer-block">
                        <strong>FUNDA</strong>
                        <div class="answer-text">${fText}</div>
                        <div class="funda-image-container"></div>
                    </div>` : ''}
                </div>
            </div>
        </article>
      `;

      // Styling adjustments for existing buttons in the header
      const headerBtns = this.querySelectorAll('.card-header button');
      headerBtns.forEach(b => {
          if (!b.classList.contains('share-btn')) {
              b.style.cssText = 'font-family: inherit; font-size: 11px; font-weight: 700; background: transparent; border: none; cursor: pointer; color: inherit; letter-spacing: 1px;';
          } else {
              b.style.cssText = 'background: transparent; border: 2px solid var(--ink); color: var(--ink); width: 24px; height: 24px; cursor: pointer; font-size: 12px; font-family: inherit; padding: 0; line-height: 1;';
          }
      });

      // Render answer/funda images lazily
      this.renderImg(q.answer.image, '.answer-image-container', 'answer-image');
      if (q.funda) {
        this.renderImg(q.funda.image, '.funda-image-container', 'answer-image');
      }

      // Event Listeners
      const btn = this.querySelector('.reveal-btn');
      const answerSection = this.querySelector('.answer-section');
      const favBtn = this.querySelector('.fav-btn');
      const wikiBtn = this.querySelector('.wiki-btn');
      const shareBtn = this.querySelector('.share-btn');

      if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = location.origin + location.pathname + '#q-' + q.id;
          if (navigator.share) {
            navigator.share({ title: 'QuizVault Question', url: url }).catch(console.error);
          } else {
            navigator.clipboard.writeText(url).then(() => {
              shareBtn.textContent = '✓';
              setTimeout(() => { shareBtn.textContent = '↗'; }, 2000);
            }).catch(() => {
              prompt('COPY_LINK:', url);
            });
          }
        });
      }

      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.toggleFavorite(q.id);
          favBtn.classList.toggle('active');
          favBtn.style.color = favBtn.classList.contains('active') ? 'var(--hot)' : 'inherit';
        });
        if (isFav) favBtn.style.color = 'var(--hot)';
      }

      if (wikiBtn) {
        wikiBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const active = wikiBtn.classList.toggle('active');
          if (active) {
            state.saveToWiki(q.id);
            wikiBtn.innerText = 'SAVED';
            wikiBtn.style.color = 'var(--hot)';
          } else {
            state.removeFromWiki(q.id);
            wikiBtn.innerText = 'SAVE_TO_WIKI';
            wikiBtn.style.color = 'inherit';
          }
        });
        if (isSaved) wikiBtn.style.color = 'var(--hot)';
      }

      if (btn && answerSection) {
        btn.addEventListener('click', () => {
          const isRevealed = answerSection.classList.toggle('revealed');
          btn.innerText = isRevealed ? 'HIDE ANSWER' : 'REVEAL ANSWER';
        });
      }
    }

    renderImg(src, selector, imgClass) {
      if (!src) return;
      const container = this.querySelector(selector);
      if (!container) return;

      const sources = Array.isArray(src) ? src : [src];
      
      const flexContainer = document.createElement('div');
      flexContainer.style.cssText = 'display:flex; gap:16px; margin-top:12px; flex-wrap:wrap;';
      
      sources.forEach(source => {
          if (typeof source !== 'string') return;
          const img = document.createElement('img');
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = source;
          img.className = imgClass;
          img.alt = 'Quiz reference image';
          img.style.cssText = 'max-height:250px; max-width:100%; border:3px solid var(--ink); display:block;';
          img.onerror = () => { img.style.display = 'none'; };
          flexContainer.appendChild(img);
      });
      
      container.appendChild(flexContainer);
    }
  }

  customElements.define('quiz-card', QuizCard);
})();
