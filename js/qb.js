/**
 * qb.js — Question Bank page logic, written for the GX Boy layout.
 *
 * Targets these elements in questionbank.html:
 *   #search-input         — search field
 *   #topic-filters        — topic chip container
 *   #questions-container  — grid of <quiz-card> elements
 *   #practice-btn         — opens practice mode (if available)
 *   #status-bar           — top-bar status text
 */
(function() {
  const TOPIC_LABELS = {
    'all':             'ALL',
    'sports':          'SPORTS',
    'wildlife':        'WILDLIFE',
    'current-affairs': 'CURRENT',
    'history':         'HISTORY',
    'politics':        'POLITICS',
    'cuisines':        'CUISINES',
    'science':         'SCIENCE',
    'literature':      'LITERATURE',
    'geography':       'GEOGRAPHY',
    'general':         'GENERAL',
  };

  let activeTopic = 'all';
  let activeDifficulty = 'all';
  let activeSearch = '';
  let _lastFilterKey = ''; // composite guard for renderFilters

  function updateURL() {
    const url = new URL(window.location);
    if (activeTopic === 'all') url.searchParams.delete('topic');
    else url.searchParams.set('topic', activeTopic);
    if (activeDifficulty === 'all') url.searchParams.delete('difficulty');
    else url.searchParams.set('difficulty', activeDifficulty);
    window.history.replaceState(null, '', url);
  }

  function init() {
    if (!window.state) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('topic')) activeTopic = urlParams.get('topic');
    if (urlParams.get('difficulty')) activeDifficulty = urlParams.get('difficulty');

    const searchEl = document.getElementById('search-input');
    if (searchEl) {
      searchEl.value = state.data.searchQuery || '';
      activeSearch = searchEl.value;

      // Initialize Worker (Item 6)
      let searchWorker;
      try {
        searchWorker = new Worker('js/search-worker.js');
        searchWorker.onmessage = function(e) {
          if (e.data.type === 'RESULTS') {
            renderListWithData(e.data.results);
          }
        };
      } catch (e) {
        console.warn('[qb] Web Worker not supported, using main thread.');
      }

      searchEl.addEventListener('input', debounce(function(e) {
        activeSearch = e.target.value;
        state.updateSearch && state.updateSearch(activeSearch);
        
        if (searchWorker) {
          searchWorker.postMessage({
            type: 'SEARCH',
            query: activeSearch,
            questions: state.data.questions,
            filter: activeTopic,
            difficulty: 'all'
          });
        } else {
          render();
        }
      }, 200));
    }

    // Keyboard Shortcuts (Item 5)
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT') return; // Don't trigger while typing
      
      const key = e.key;
      if (key >= '1' && key <= '9') {
        const chips = document.querySelectorAll('.topic-chip');
        if (chips[key - 1]) chips[key - 1].click();
      }
    });

    state.subscribe(render);
    if (state.loadQuestions) state.loadQuestions();
    render(state.data);

    // Handle ?drill=wiki from wiki.html practice button
    if (urlParams.get('drill') === 'wiki') {
      const wikiIds = JSON.parse(sessionStorage.getItem('qv_wiki_practice') || '[]');
      sessionStorage.removeItem('qv_wiki_practice');
      if (wikiIds.length > 0) {
        // Wait for questions to load, then start practice
        const startWikiDrill = () => {
          const allQs = state.data.questions || [];
          const pool = allQs.filter(q => wikiIds.includes(String(q.id)));
          if (pool.length > 0 && window.QV && window.QV.practice) {
            window.QV.practice.startWith({ questions: pool, mode: 'endless' });
          } else if (allQs.length === 0) {
            // Questions not loaded yet, wait
            setTimeout(startWikiDrill, 300);
          }
        };
        setTimeout(startWikiDrill, 500);
      }
    }

    // Handle ?drill=random from command palette / floating button
    if (urlParams.get('drill') === 'random') {
      const startRandomDrill = () => {
        const allQs = state.data.questions || [];
        if (allQs.length > 0 && window.QV && window.QV.practice) {
          const shuffled = [...allQs].sort(() => 0.5 - Math.random()).slice(0, 10);
          window.QV.practice.startWith({ questions: shuffled, mode: 'endless' });
        } else if (allQs.length === 0) {
          setTimeout(startRandomDrill, 300);
        }
      };
      setTimeout(startRandomDrill, 500);
    }

    
    // Check hash on load
    setTimeout(checkHash, 500);
  }

  function checkHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#q-')) {
      const qid = hash.slice(3);
      const el = document.getElementById('q-' + qid);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '4px solid var(--hot)';
        setTimeout(() => { el.style.outline = ''; }, 3000);
      }
    } else {
      // Restore Scroll Position (Item 4)
      const lastQ = localStorage.getItem('qv_last_viewed_q');
      if (lastQ) {
        const el = document.getElementById('q-' + lastQ);
        if (el) el.scrollIntoView({ block: 'center' });
      }
    }
  }

  function render(data) {
    data = data || state.data;
    if (!data || !data.questions) return;

    renderFilters(data.questions);
    renderDifficultyFilters(data.questions);
    renderList(data.questions);
    updateStatus(data);
  }


  function renderDifficultyFilters(questions) {
    const wrap = document.getElementById('difficulty-pills-container');
    if (!wrap) return;
    wrap.innerHTML = '';

    const levels = ['all', 'easy', 'medium', 'hard'];
    
    // Count questions per difficulty
    const counts = { all: questions.length };
    questions.forEach(q => {
      const diff = (q.difficulty || 'medium').toLowerCase();
      counts[diff] = (counts[diff] || 0) + 1;
    });

    levels.forEach(lvl => {
      const count = counts[lvl] || 0;
      if (lvl !== 'all' && count === 0) return; // Skip levels with 0 entries
      
      const btn = document.createElement('button');
      btn.className = 'btn topic-chip' + (lvl === activeDifficulty ? ' active' : '');
      btn.textContent = lvl.toUpperCase() + ' (' + count + ')';
      btn.style.padding = '4px 10px';
      btn.style.fontSize = '10px';
      
      btn.addEventListener('click', () => {
        if (activeDifficulty === lvl) return;
        activeDifficulty = lvl;
        
        if (typeof window.gsap !== 'undefined') {
          gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
        }
        updateURL();
        render(state.data);
      });
      wrap.appendChild(btn);
    });
  }

  function renderFilters(questions) {
    const wrap = document.getElementById('topic-filters');
    if (!wrap) return;
    // Only re-render chips when topic+count changes (Fix 4)
    const _filterKey = activeTopic + '|' + questions.length;
    if (_filterKey === _lastFilterKey) return;
    _lastFilterKey = _filterKey;
    wrap.innerHTML = '';

    const counts = { all: questions.length };
    questions.forEach(function(q) {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });

    Object.keys(TOPIC_LABELS).forEach(function(slug) {
      const count = counts[slug] || (slug === 'all' ? questions.length : 0);
      if (slug !== 'all' && count === 0) return; // skip empty topics
      const btn = document.createElement('button');
      btn.className = 'btn topic-chip' + (slug === activeTopic ? ' active' : '');
      btn.textContent = TOPIC_LABELS[slug] + ' (' + count + ')';
      btn.dataset.topic = slug;
      btn.addEventListener('click', function() {
        if (activeTopic === slug) return; // Ignore if already selected
        activeTopic = slug;

        // Simple, fast filter change — no GSAP fly-away
        updateURL();
        renderFilters(questions);
        renderList(questions);
        updateStatus({ questions: questions });
      });
      wrap.appendChild(btn);
    });
  }

  function renderList(questions) {
    const filtered = filter(questions);
    renderListWithData(filtered);
  }

  function renderListWithData(filtered) {
    const container = document.getElementById('questions-container');
    if (!container) return;

    let flipState = null;
    if (window.gsap && window.Flip && container.children.length > 0) {
      window.gsap.registerPlugin(window.Flip);
      flipState = window.Flip.getState(container.children);
    }

    updateStatus(state.data, filtered);
    container.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:40px;text-align:center;color:#888;font-size:10px';
      empty.textContent = '> NO QUESTIONS MATCH FILTER';
      container.appendChild(empty);
      
      const searchEl = document.getElementById('search-input');
      if (searchEl && activeSearch && window.QV && window.QV.anim) {
        window.QV.anim.shakeInput(searchEl);
      }
      return;
    }

    // Render with Virtual Scrolling / Batching (Item 10)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          if (!card.rendered) {
             const q = filtered[card.dataset.idx];
             card.setData(q, parseInt(card.dataset.idx), { highlightQuery: activeSearch });
             card.rendered = true;
             
             // Subtle fade-in only — global ScrollTrigger.batch in animations.js handles entrance
          }
          // Record Last Viewed (Item 4)
          localStorage.setItem('qv_last_viewed_q', card.dataset.id);
        }
      });
    }, { threshold: 0.1 });

    const frag = document.createDocumentFragment();
    filtered.forEach((q, i) => {
       const card = document.createElement('quiz-card');
       card.id = 'q-' + q.id;
       card.dataset.flipId = 'q-' + q.id;
       card.dataset.idx = i;
       card.dataset.id = q.id;
       card.style.minHeight = '150px'; // Placeholder height
       frag.appendChild(card);
       observer.observe(card);
    });
    container.appendChild(frag);

    if (flipState && window.Flip) {
      window.Flip.from(flipState, {
        duration: 0.4,
        ease: 'power2.out',
        absolute: true,
        stagger: 0.02,
        onEnter: elements => window.gsap.fromTo(elements, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.4}),
        onLeave: elements => window.gsap.to(elements, {opacity: 0, scale: 0.9, duration: 0.4})
      });
    }
  }

  function filter(questions) {
    const q = (activeSearch || '').toLowerCase().trim();
    return questions.filter(function(item) {
      if (activeTopic !== 'all' && item.topic !== activeTopic) return false;
      if (activeDifficulty !== 'all' && (item.difficulty || 'medium').toLowerCase() !== activeDifficulty) return false;
      if (q) {
        const target = (item.question.text + ' ' + item.answer.text + ' ' + (item.funda?.text || ''));
        if (window.state && window.state.fuzzyMatch) {
          if (!window.state.fuzzyMatch(q, target)) return false;
        } else {
          if (!target.toLowerCase().includes(q)) return false;
        }
      }
      return true;
    });
  }

  function updateStatus(data, filteredList) {
    const status = document.getElementById('status-bar');
    if (!status) return;
    const filtered = filteredList || filter(data.questions || []);
    status.textContent = 'SYSTEM ONLINE // Q_COUNT: ' + filtered.length +
                        (activeTopic !== 'all' ? ' // FILTER: ' + TOPIC_LABELS[activeTopic] : '');
  }

  function debounce(fn, ms) {
    let t;
    return function() {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
