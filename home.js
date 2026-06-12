/**
 * home.js — Landing page logic
 */

const TOPIC_META = {
  "sports": {
    label:  "Sports",
    icon:   "🏆",
    desc:   "Cricket, football, athletics and more",
    slug:   "sports"
  },
  "wildlife": {
    label:  "Wildlife",
    icon:   "🦁",
    desc:   "Animals, ecosystems and natural world",
    slug:   "wildlife"
  },
  "current-affairs": {
    label:  "Current Affairs",
    icon:   "📰",
    desc:   "Recent events shaping the world today",
    slug:   "current-affairs"
  },
  "history": {
    label:  "History",
    icon:   "🏛️",
    desc:   "Empires, discoveries and turning points",
    slug:   "history"
  },
  "politics": {
    label:  "Politics",
    icon:   "⚖️",
    desc:   "Governance, international relations and law",
    slug:   "politics"
  },
  "cuisines": {
    label:  "Cuisines",
    icon:   "🍜",
    desc:   "Food, drink and culinary traditions",
    slug:   "cuisines"
  }
};

function init() {
  const questions = QUIZ_QUESTIONS;

  // Loader Logic
  const loaderWrapper = document.getElementById("loader-wrapper");
  const progressBar = document.getElementById("progress-bar");
  const landingHero = document.getElementById("landing-hero");
  
  if (loaderWrapper && progressBar && landingHero) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        progressBar.style.width = '100%';
        
        setTimeout(() => {
          document.body.classList.add('loaded');
          setTimeout(() => {
            landingHero.classList.add('revealed');
            startTypewriter();
          }, 300);
        }, 500);
      } else {
        progressBar.style.width = progress + '%';
      }
    }, 100);
  }

  function startTypewriter() {
    const topEl    = document.getElementById('title-top');
    const bottomEl = document.getElementById('hero-heading');
    if (!topEl || !bottomEl) return;

    const topText    = "the CIRS";
    const bottomText = "Quizbank";

    // Start both elements completely empty
    topEl.textContent    = "";
    bottomEl.textContent = "";

    // Create a single cursor span that we'll move between elements
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';

    // Place cursor inside title-top to begin
    topEl.appendChild(cursor);

    function typeInto(el, text, charIndex, onDone) {
      if (charIndex < text.length) {
        // Insert text node BEFORE the cursor, so cursor stays at the end
        el.insertBefore(document.createTextNode(text.charAt(charIndex)), cursor);
        setTimeout(() => typeInto(el, text, charIndex + 1, onDone), 90);
      } else {
        // Done with this line
        if (onDone) setTimeout(onDone, 250);
      }
    }

    // Phase 1: type "the CIRS" with cursor in topEl
    typeInto(topEl, topText, 0, () => {
      // Phase 2: move cursor down to bottomEl, then type "Quizbank"
      bottomEl.appendChild(cursor);
      typeInto(bottomEl, bottomText, 0, () => {
        // Phase 3: remove cursor when done
        setTimeout(() => cursor.remove(), 600);
      });
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight - 100) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

  // Update total stat
  const statEl = document.getElementById("stat-total");
  if (statEl) statEl.textContent = questions.length;

  // Count per topic
  const counts = {};
  questions.forEach(q => {
    counts[q.topic] = (counts[q.topic] || 0) + 1;
  });

  // Render topic grid
  const grid = document.getElementById("topics-grid");
  if (!grid) return;

  Object.entries(TOPIC_META).forEach(([topicKey, meta]) => {
    const count = counts[topicKey] || 0;
    const card = document.createElement("a");
    card.href = `questionbank.html?topic=${topicKey}`;
    card.className = `topic-card ${topicKey}`;
    card.setAttribute("aria-label", `Browse ${meta.label} questions`);
    card.innerHTML = `
      <div class="topic-card-icon" aria-hidden="true">${meta.icon}</div>
      <div class="topic-card-content">
        <div class="topic-card-name">${meta.label}</div>
        <div class="topic-card-desc">${meta.desc}</div>
        <div class="topic-card-count">${count} question${count !== 1 ? 's' : ''}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", init);
