/**
 * command-palette.js - Standalone Brutalist Command Palette for QuizVault
 * Press "/" to activate on any page.
 */
(function() {
  const css = `
    .command-palette-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 10, 10, 0.98);
      color: #0a0a0a;
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 10vh;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
      font-family: 'Courier New', monospace;
      box-sizing: border-box;
    }
    .command-palette-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .command-palette-container {
      width: 90%;
      max-width: 680px;
      background: #f4f4f0;
      border: 4px solid #0a0a0a;
      box-shadow: 12px 12px 0px #0a0a0a;
      padding: 24px;
      box-sizing: border-box;
    }
    .command-palette-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 3px solid #0a0a0a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .command-palette-title {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .command-palette-close {
      cursor: pointer;
      font-weight: 900;
      font-size: 16px;
      background: none;
      border: none;
    }
    .command-palette-input {
      width: 100%;
      background: #f4f4f0;
      border: 3px solid #0a0a0a;
      color: #0a0a0a;
      padding: 12px;
      font-size: 18px;
      font-family: inherit;
      font-weight: 700;
      outline: none;
      box-sizing: border-box;
    }
    .command-palette-input:focus {
      border-color: #ff3e3e;
    }
    .command-palette-results {
      max-height: 320px;
      overflow-y: auto;
      margin-top: 16px;
      border: 3px solid #0a0a0a;
      background: #f4f4f0;
    }
    .command-palette-item {
      padding: 12px;
      border-bottom: 2px solid #0a0a0a;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
      transition: background 0.15s ease;
    }
    .command-palette-item:hover, .command-palette-item.selected {
      background: #ff3e3e;
      color: #f4f4f0;
    }
    .command-palette-item:last-child {
      border-bottom: none;
    }
    .command-palette-tag {
      font-size: 9px;
      border: 2px solid currentColor;
      padding: 2px 6px;
      margin-left: 8px;
    }
    .command-palette-hint {
      font-size: 10px;
      color: #777;
      margin-top: 12px;
      text-align: right;
      letter-spacing: 1px;
    }
    /* Floating random Q button style */
    .random-q-floating-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      border: 3px solid #0a0a0a;
      background: #ff3e3e;
      color: #f4f4f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 1px;
      padding: 12px 18px;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 4px 4px 0px #0a0a0a;
      transition: all 0.15s ease;
    }
    .random-q-floating-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #0a0a0a;
    }
  `;

  let overlay, input, resultsBox;
  let matches = [];
  let selectedIdx = 0;

  // Static commands mapping
  const COMMANDS = [
    { text: "NAVIGATE: GO_TO_HOME", action: () => location.href = "index.html", keys: "g h" },
    { text: "NAVIGATE: GO_TO_BANK", action: () => location.href = "questionbank.html", keys: "g b" },
    { text: "NAVIGATE: GO_TO_WIKI", action: () => location.href = "wiki.html", keys: "g w" },
    { text: "NAVIGATE: GO_TO_STATS", action: () => location.href = "analytics.html", keys: "g s" },
    { text: "PRACTICE: START_RANDOM_SESSION", action: () => {
      // Trigger random practice setup
      if (window.location.href.indexOf('questionbank') === -1) {
        window.location.href = 'questionbank.html?drill=random';
      } else {
        const btn = document.getElementById('drill-weak-btn') || document.getElementById('hero-practice-btn');
        if (btn) btn.click();
      }
    }, keys: "r p" }
  ];

  function init() {
    // Inject styles
    const styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // Create palette HTML elements
    overlay = document.createElement("div");
    overlay.className = "command-palette-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="command-palette-container">
        <div class="command-palette-header">
          <div class="command-palette-title">SYSTEM_COMMAND_PALETTE // v2.0</div>
          <button class="command-palette-close">×</button>
        </div>
        <input type="text" class="command-palette-input" placeholder="SEARCH_COMMANDS_OR_QUESTIONS... (ESC to exit)" autocomplete="off">
        <div class="command-palette-results"></div>
        <div class="command-palette-hint">ARROW_KEYS to navigate / ENTER to select / ESC to close</div>
      </div>
    `;
    document.body.appendChild(overlay);

    input = overlay.querySelector(".command-palette-input");
    resultsBox = overlay.querySelector(".command-palette-results");

    // Close button event
    overlay.querySelector(".command-palette-close").onclick = closePalette;

    // Listeners
    window.addEventListener("keydown", handleGlobalKeyDown);
    input.addEventListener("keydown", handleInputKeyDown);
    input.addEventListener("input", handleSearch);

    // Create Floating Random Q button on landing/other pages
    createFloatingRandomBtn();
  }

  function createFloatingRandomBtn() {
    // Disabled per user request
  }

  function openPalette() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    input.value = "";
    selectedIdx = 0;
    renderResults(COMMANDS);
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function handleGlobalKeyDown(e) {
    // Open on "/" key if not inside an input box already
    if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      openPalette();
    }
    // Close on Escape
    if (e.key === "Escape" && overlay.classList.contains("open")) {
      e.preventDefault();
      closePalette();
    }
  }

  function handleInputKeyDown(e) {
    if (!overlay.classList.contains("open")) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % matches.length;
      updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + matches.length) % matches.length;
      updateSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[selectedIdx]) {
        executeItem(matches[selectedIdx]);
      }
    }
  }

  function executeItem(item) {
    closePalette();
    if (item.action) {
      item.action();
    } else if (item.questionId) {
      // Deep link scroll redirect to target card
      location.href = "questionbank.html#q-" + item.questionId;
    }
  }

  function handleSearch() {
    const query = input.value.toLowerCase().trim();
    if (!query) {
      renderResults(COMMANDS);
      return;
    }

    // 1. Filter local commands
    let list = COMMANDS.filter(c => c.text.toLowerCase().includes(query) || c.keys.includes(query));

    // 2. Fuzzy search database questions if loaded
    if (typeof QUIZ_QUESTIONS !== "undefined" && Array.isArray(QUIZ_QUESTIONS)) {
      const filteredQ = QUIZ_QUESTIONS.filter(q => {
        return q.question.text.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
      }).slice(0, 5); // limit output count

      const qItems = filteredQ.map(q => ({
        text: `QUESTION: ${q.question.text.substring(0, 60)}...`,
        tag: q.topic.toUpperCase(),
        questionId: q.id
      }));

      list = list.concat(qItems);
    }

    selectedIdx = 0;
    renderResults(list);
  }

  function renderResults(list) {
    matches = list;
    resultsBox.innerHTML = "";
    if (matches.length === 0) {
      resultsBox.innerHTML = `<div style="padding:16px;font-size:11px;color:#777;text-align:center;">NO_RESULTS_FOUND</div>`;
      return;
    }

    matches.forEach((m, idx) => {
      const item = document.createElement("div");
      item.className = "command-palette-item";
      if (idx === selectedIdx) item.classList.add("selected");
      
      const tagHtml = m.keys ? `<span class="command-palette-tag">${m.keys}</span>` : (m.tag ? `<span class="command-palette-tag" style="background:currentColor; color:#f4f4f0;">${m.tag}</span>` : '');
      
      item.innerHTML = `
        <span>${m.text}</span>
        ${tagHtml}
      `;
      item.onclick = () => executeItem(m);
      resultsBox.appendChild(item);
    });
  }

  function updateSelection() {
    const items = resultsBox.querySelectorAll(".command-palette-item");
    items.forEach((item, idx) => {
      if (idx === selectedIdx) {
        item.classList.add("selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
