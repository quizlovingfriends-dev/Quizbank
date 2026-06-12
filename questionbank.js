/**
 * questionbank.js — Main logic for the Question Bank page
 */

const TOPIC_META = {
  "sports": { label: "Sports" },
  "wildlife": { label: "Wildlife" },
  "current-affairs": { label: "Current Affairs" },
  "history": { label: "History" },
  "politics": { label: "Politics" },
  "cuisines": { label: "Cuisines" }
};

let currentFilter = 'all';
let searchQuery = '';

function init() {
  // 1. Initialise the UI based on URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('topic')) {
    currentFilter = urlParams.get('topic');
  }

  // 2. Render sidebar filters
  renderSidebarFilters();
  
  // 3. Set up event listeners
  setupEventListeners();

  // 4. Initial render of questions
  renderQuestions();
}

function renderSidebarFilters() {
  const filterList = document.getElementById('filter-list');
  if (!filterList) return;

  const questions = QUIZ_QUESTIONS;
  
  // Count questions per topic
  const counts = { all: questions.length };
  questions.forEach(q => {
    counts[q.topic] = (counts[q.topic] || 0) + 1;
  });

  let html = `
    <li>
      <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-topic="all">
        <div class="filter-btn-left">
          <span class="filter-dot all"></span>
          All Topics
        </div>
        <span class="filter-count">${counts.all}</span>
      </button>
    </li>
  `;

  Object.entries(TOPIC_META).forEach(([topic, meta]) => {
    const count = counts[topic] || 0;
    html += `
      <li>
        <button class="filter-btn ${currentFilter === topic ? 'active' : ''}" data-topic="${topic}">
          <div class="filter-btn-left">
            <span class="filter-dot ${topic}"></span>
            ${meta.label}
          </div>
          <span class="filter-count">${count}</span>
        </button>
      </li>
    `;
  });

  filterList.innerHTML = html;

  // Add event listeners to newly created buttons
  const btns = filterList.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update UI
      btns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      // Update state and re-render
      currentFilter = e.currentTarget.dataset.topic;
      
      // Update URL without reloading
      const url = new URL(window.location);
      if (currentFilter === 'all') {
        url.searchParams.delete('topic');
      } else {
        url.searchParams.set('topic', currentFilter);
      }
      window.history.pushState({}, '', url);

      renderQuestions();
    });
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderQuestions();
    });
  }

  const revealAllBtn = document.getElementById('reveal-all-btn');
  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.question-card');
      const btns = document.querySelectorAll('.reveal-btn');
      const answers = document.querySelectorAll('.answer-section');
      
      cards.forEach(c => c.classList.add('revealed'));
      btns.forEach(b => {
        b.classList.add('active');
        b.innerHTML = `
          Hide Markscheme
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
      });
      answers.forEach(a => a.classList.add('revealed'));
    });
  }

  const hideAllBtn = document.getElementById('hide-all-btn');
  if (hideAllBtn) {
    hideAllBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.question-card');
      const btns = document.querySelectorAll('.reveal-btn');
      const answers = document.querySelectorAll('.answer-section');
      
      cards.forEach(c => c.classList.remove('revealed'));
      btns.forEach(b => {
        b.classList.remove('active');
        b.innerHTML = `
          Reveal Markscheme
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
      });
      answers.forEach(a => a.classList.remove('revealed'));
    });
  }
}

function highlightText(text, query) {
  if (!query) return text;
  
  // Create a safe regex
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  
  // We need to carefully avoid highlighting HTML tags (like <strong> inside the text)
  // Simple approach: only highlight if text doesn't contain HTML tags easily breakable
  // A robust approach would parse DOM, but replacing on raw string helps here. 
  // Let's rely on basic text replacement but cautiously.
  
  // Split by tags to only replace text outside tags.
  const parts = text.split(/(<[^>]*>)/);
  for (let i = 0; i < parts.length; i++) {
    // Only process non-tag parts (even indices usually, or check specifically)
    if (!parts[i].startsWith('<')) {
      parts[i] = parts[i].replace(regex, '<span class="highlight">$1</span>');
    }
  }
  return parts.join('');
}

function renderQuestions() {
  const container = document.getElementById('question-list');
  const titleEl = document.getElementById('topbar-title');
  const subEl = document.getElementById('topbar-sub');
  if (!container) return;

  const questions = QUIZ_QUESTIONS;

  // Filter questions
  const filtered = questions.filter(q => {
    // Filter by topic
    if (currentFilter !== 'all' && q.topic !== currentFilter) return false;
    
    // Filter by search
    if (searchQuery) {
      const searchTarget = (
        q.question.text + ' ' + 
        q.answer.text + ' ' + 
        q.funda.text + ' ' + 
        (TOPIC_META[q.topic]?.label || '')
      ).toLowerCase();
      
      if (!searchTarget.includes(searchQuery)) return false;
    }
    
    return true;
  });

  // Update Topbar
  if (titleEl) {
    titleEl.textContent = currentFilter === 'all' ? 'All Questions' : TOPIC_META[currentFilter].label;
  }
  if (subEl) {
    if (searchQuery) {
       subEl.textContent = `Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    } else {
       subEl.textContent = `Showing ${filtered.length} question${filtered.length !== 1 ? 's' : ''}`;
    }
  }

  // Render HTML
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No questions found</div>
        <div class="empty-state-desc">Try adjusting your filters or search query.</div>
      </div>
    `;
    return;
  }

  let html = '';
  
  filtered.forEach((q, index) => {
    const topicLabel = TOPIC_META[q.topic]?.label || q.topic;
    
    // Highlight logic
    const qText = highlightText(q.question.text, searchQuery);
    const aText = highlightText(q.answer.text, searchQuery);
    const fText = highlightText(q.funda.text, searchQuery);

    // Image logic
    const qImage = q.question.image ? `<img src="${q.question.image}" class="question-image" alt="Question Image">` : '';
    const aImage = q.answer.image ? `<img src="${q.answer.image}" class="answer-image" alt="Answer Image">` : '';
    const fImage = q.funda.image ? `<img src="${q.funda.image}" class="answer-image" alt="Funda Image">` : '';

    html += `
      <article class="question-card" id="q-${q.id}">
        <!-- Header -->
        <div class="card-header">
          <span class="card-num">Q${index + 1}</span>
          <span class="topic-badge ${q.topic}">${topicLabel}</span>
        </div>
        
        <!-- Question Body -->
        <div class="card-body">
          <div class="question-text">${qText}</div>
          ${qImage}
          
          <button class="reveal-btn" aria-expanded="false" onclick="toggleAnswer(this, ${q.id})">
            Reveal Markscheme
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <!-- Answer Section (Hidden by default) -->
        <div class="answer-section" id="answer-${q.id}">
          <div class="answer-divider"></div>
          <div class="answer-inner">
            
            <div class="answer-block">
              <div class="answer-block-label">Answer</div>
              <div class="answer-text">${aText}</div>
              ${aImage}
            </div>

            <div class="answer-block">
              <div class="answer-block-label funda-block-label">Funda</div>
              <div class="answer-text">${fText}</div>
              ${fImage}
            </div>

          </div>
        </div>
      </article>
    `;
  });

  container.innerHTML = html;
}

// Global function so onclick in HTML can access it
window.toggleAnswer = function(btn, id) {
  const answerSection = document.getElementById(`answer-${id}`);
  const card = document.getElementById(`q-${id}`);
  
  const isRevealed = answerSection.classList.contains('revealed');
  
  if (isRevealed) {
    answerSection.classList.remove('revealed');
    card.classList.remove('revealed');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `
      Reveal Markscheme
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
  } else {
    answerSection.classList.add('revealed');
    card.classList.add('revealed');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    btn.innerHTML = `
      Hide Markscheme
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
  }
}

document.addEventListener("DOMContentLoaded", init);
