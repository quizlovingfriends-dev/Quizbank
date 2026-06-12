/**
 * practice.js — Practice Mode Logic
 */

let practicePool = [];
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 120;
let isPaused = false;

const practiceModal = document.getElementById('practice-modal');
const practiceOverlay = document.getElementById('practice-overlay');
const categoryListEl = document.getElementById('category-list');
const practiceQuestionEl = document.getElementById('question-text');
const practiceImageContainer = document.getElementById('image-container');
const practiceAnswerArea = document.getElementById('answer-area');
const practiceAnswerText = document.getElementById('answer-text');
const practiceFundaText = document.getElementById('funda-text');
const practiceTimerEl = document.getElementById('timer');
const practiceProgressEl = document.getElementById('progress');
const timeUpMsg = document.getElementById('time-up');

const showAnswerBtn = document.getElementById('show-answer');
const nextQuestionBtn = document.getElementById('next-question');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const endPracticeBtn = document.getElementById('end-practice');

/**
 * Initialize Practice Mode
 */
function initPracticeMode() {
  const practiceBtn = document.getElementById('practice-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const startPracticeBtn = document.getElementById('start-practice');

  if (practiceBtn) {
    practiceBtn.addEventListener('click', openSetupPanel);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSetupPanel);
  }

  if (startPracticeBtn) {
    startPracticeBtn.addEventListener('click', () => {
      const selectedTopics = Array.from(document.querySelectorAll('.topic-checkbox:checked'))
        .map(cb => cb.value);
      
      if (selectedTopics.length === 0) {
        alert("Please select at least one category!");
        return;
      }
      
      startPractice(selectedTopics);
    });
  }

  // Handle Select All Topic (if added in JS)
  // We'll populate the category list now
  populateCategoryList();
}

/**
 * Populate categories from QUIZ_QUESTIONS topics
 */
function populateCategoryList() {
  if (!categoryListEl) return;
  
  // Use unique topics from QUIZ_QUESTIONS
  const topics = [...new Set(QUIZ_QUESTIONS.map(q => q.topic))];
  
  // Topic labels mapping (sync with home.js if possible)
  const topicLabels = {
    "sports": "Sports",
    "wildlife": "Wildlife",
    "current-affairs": "Current Affairs",
    "history": "History",
    "politics": "Politics",
    "cuisines": "Cuisines",
    "general": "General"
  };

  categoryListEl.innerHTML = `
    <label class="category-chip all">
      <input type="checkbox" id="select-all-topics" checked>
      <span>Select All</span>
    </label>
  `;

  topics.forEach(topic => {
    const label = topicLabels[topic] || topic.charAt(0).toUpperCase() + topic.slice(1);
    const chip = document.createElement('label');
    chip.className = 'category-chip';
    chip.innerHTML = `
      <input type="checkbox" class="topic-checkbox" value="${topic}" checked>
      <span>${label}</span>
    `;
    categoryListEl.appendChild(chip);
  });

  // Select All logic
  const selectAllCb = document.getElementById('select-all-topics');
  selectAllCb.addEventListener('change', (e) => {
    document.querySelectorAll('.topic-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
}

function openSetupPanel() {
  practiceModal.classList.add('active');
  practiceModal.setAttribute('aria-hidden', 'false');
}

function closeSetupPanel() {
  practiceModal.classList.remove('active');
  practiceModal.setAttribute('aria-hidden', 'true');
}

/**
 * Start Practice Session
 */
function startPractice(selectedTopics) {
  // 1. Filter questions
  practicePool = QUIZ_QUESTIONS.filter(q => selectedTopics.includes(q.topic));
  
  if (practicePool.length === 0) {
    alert("No questions found for the selected categories!");
    return;
  }

  // 2. Shuffle (Fisher-Yates)
  for (let i = practicePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [practicePool[i], practicePool[j]] = [practicePool[j], practicePool[i]];
  }

  // 3. Reset state
  currentQuestionIndex = 0;
  closeSetupPanel();
  
  // 4. Open overlay
  practiceOverlay.classList.add('active');
  practiceOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // prevent scroll

  renderQuestion();
}

/**
 * Render current question
 */
function renderQuestion() {
  const q = practicePool[currentQuestionIndex];
  
  // UI Cleanup
  practiceAnswerArea.classList.add('hidden');
  timeUpMsg.classList.add('hidden');
  showAnswerBtn.classList.remove('hidden');
  nextQuestionBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  resumeBtn.classList.add('hidden');
  isPaused = false;

  // Text content
  practiceQuestionEl.innerHTML = q.question.text;
  practiceProgressEl.textContent = `Question ${currentQuestionIndex + 1} of ${practicePool.length}`;
  
  // Image
  practiceImageContainer.innerHTML = "";
  if (q.question.image) {
    const img = document.createElement('img');
    img.src = q.question.image;
    img.alt = "Question image";
    practiceImageContainer.appendChild(img);
  }

  // Answer data
  practiceAnswerText.innerHTML = q.answer.text;
  practiceFundaText.innerHTML = q.funda.text || "No additional explanation provided.";

  // Start Timer
  startTimer();
}

/**
 * Timer logic
 */
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 120;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeUp();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  practiceTimerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function handleTimeUp() {
  timeUpMsg.classList.remove('hidden');
  showAnswer();
}

function showAnswer() {
  clearInterval(timerInterval);
  practiceAnswerArea.classList.remove('hidden');
  showAnswerBtn.classList.add('hidden');
  nextQuestionBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.add('hidden');
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < practicePool.length) {
    renderQuestion();
  } else {
    alert("Practice session completed! You've gone through all selected questions.");
    endPractice();
  }
}

function pauseTimer() {
  isPaused = true;
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.remove('hidden');
}

function resumeTimer() {
  isPaused = false;
  resumeBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
}

function endPractice() {
  clearInterval(timerInterval);
  practiceOverlay.classList.remove('active');
  practiceOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // restore scroll
}

// Event Listeners for Controls
showAnswerBtn.addEventListener('click', showAnswer);
nextQuestionBtn.addEventListener('click', nextQuestion);
pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
endPracticeBtn.addEventListener('click', endPractice);

// Initialize on load
document.addEventListener('DOMContentLoaded', initPracticeMode);
