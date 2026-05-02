document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProcessTimeline();
  initFlashcards();
  initQuiz();
  initChat();
});

// --- Navigation Logic ---
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update buttons
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update views
      const targetId = btn.getAttribute('data-target');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// --- Process Logic ---
function initProcessTimeline() {
  const container = document.getElementById('process-container');
  indianElectionData.process.forEach(step => {
    const el = document.createElement('div');
    el.className = 'process-step';
    el.innerHTML = `
      <div class="step-icon"><i class="${step.icon}"></i></div>
      <div class="step-content">
        <h3>Step ${step.step}: ${step.title}</h3>
        <p>${step.description}</p>
      </div>
    `;
    container.appendChild(el);
  });
}

// --- Flashcard Logic ---
let currentFlashcardIndex = 0;

function initFlashcards() {
  const flashcardEl = document.getElementById('current-flashcard');
  const prevBtn = document.getElementById('fc-prev');
  const nextBtn = document.getElementById('fc-next');

  // Flip interaction
  flashcardEl.addEventListener('click', () => {
    flashcardEl.classList.toggle('is-flipped');
  });

  // Controls
  prevBtn.addEventListener('click', () => {
    if (currentFlashcardIndex > 0) {
      currentFlashcardIndex--;
      updateFlashcardUI();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentFlashcardIndex < indianElectionData.flashcards.length - 1) {
      currentFlashcardIndex++;
      updateFlashcardUI();
    }
  });

  updateFlashcardUI(); // Initial render
}

function updateFlashcardUI() {
  const flashcardEl = document.getElementById('current-flashcard');
  const termEl = document.getElementById('fc-term');
  const defEl = document.getElementById('fc-def');
  const counterEl = document.getElementById('fc-counter');
  const prevBtn = document.getElementById('fc-prev');
  const nextBtn = document.getElementById('fc-next');

  // Reset flip state if moving to next card
  flashcardEl.classList.remove('is-flipped');

  // Slight delay to allow flip animation to reset before changing text
  setTimeout(() => {
    const cardData = indianElectionData.flashcards[currentFlashcardIndex];
    termEl.textContent = cardData.term;
    defEl.textContent = cardData.definition;
    counterEl.textContent = `${currentFlashcardIndex + 1} / ${indianElectionData.flashcards.length}`;

    prevBtn.disabled = currentFlashcardIndex === 0;
    nextBtn.disabled = currentFlashcardIndex === indianElectionData.flashcards.length - 1;
    
    // Visual styling for disabled buttons
    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  }, 150);
}

// --- Quiz Logic ---
let currentQuestionIndex = 0;
let score = 0;

function initQuiz() {
  document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
  document.getElementById('next-q-btn').addEventListener('click', nextQuestion);
  document.getElementById('restart-quiz-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    startQuiz();
  });
}

function startQuiz() {
  document.getElementById('quiz-intro').classList.remove('active');
  document.getElementById('quiz-results').classList.remove('active');
  document.getElementById('quiz-active').classList.add('active');
  loadQuestion();
}

function loadQuestion() {
  const qData = indianElectionData.quiz[currentQuestionIndex];
  
  // Update progress
  document.getElementById('quiz-progress-text').textContent = `Question ${currentQuestionIndex + 1} of ${indianElectionData.quiz.length}`;
  const progressPercent = ((currentQuestionIndex) / indianElectionData.quiz.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  // Render text
  document.getElementById('quiz-question-text').textContent = qData.question;
  
  // Render options
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  
  qData.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(index, btn));
    optionsContainer.appendChild(btn);
  });

  // Hide feedback box
  document.getElementById('quiz-feedback').classList.add('hidden');
}

function selectAnswer(selectedIndex, selectedBtn) {
  const qData = indianElectionData.quiz[currentQuestionIndex];
  const optionsContainer = document.getElementById('quiz-options');
  const allBtns = optionsContainer.querySelectorAll('.option-btn');

  // Disable all buttons
  allBtns.forEach(btn => btn.disabled = true);

  // Check correct
  const isCorrect = selectedIndex === qData.correctIndex;
  
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    score++;
  } else {
    selectedBtn.classList.add('incorrect');
    // Highlight correct one
    allBtns[qData.correctIndex].classList.add('correct');
  }

  // Show Feedback
  const feedbackBox = document.getElementById('quiz-feedback');
  const feedbackText = document.getElementById('feedback-text');
  const explanationText = document.getElementById('explanation-text');

  feedbackBox.classList.remove('hidden');
  
  if (isCorrect) {
    feedbackText.textContent = "Correct!";
    feedbackText.className = "correct-text";
  } else {
    feedbackText.textContent = "Incorrect.";
    feedbackText.className = "incorrect-text";
  }
  
  explanationText.textContent = qData.explanation;
  
  // Change next button text if it's the last question
  if (currentQuestionIndex === indianElectionData.quiz.length - 1) {
    document.getElementById('next-q-btn').textContent = "See Results";
  } else {
    document.getElementById('next-q-btn').textContent = "Next Question";
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < indianElectionData.quiz.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('quiz-active').classList.remove('active');
  document.getElementById('quiz-results').classList.add('active');
  
  document.getElementById('final-score').textContent = score;
  document.getElementById('total-questions').textContent = indianElectionData.quiz.length;
  
  const progressPercent = 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  const msgEl = document.getElementById('score-message');
  if (score === indianElectionData.quiz.length) {
    msgEl.textContent = "Outstanding! You are a democratic champion!";
  } else if (score >= indianElectionData.quiz.length / 2) {
    msgEl.textContent = "Good job! You have a solid grasp of the system.";
  } else {
    msgEl.textContent = "Keep learning! Democracy relies on informed citizens.";
  }
}

// --- Chat Logic ---
function initChat() {
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');

  sendBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.textContent;
      handleSendMessage();
    });
  });
}

async function handleSendMessage() {
  const inputEl = document.getElementById('chat-input');
  const text = inputEl.value.trim();
  if (!text) return;

  // Add user message
  appendMessage(text, 'user-message');
  inputEl.value = '';

  // Add typing indicator
  const messagesContainer = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `<div class="message-bubble"><em>Thinking...</em></div>`;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const response = await getChatResponse(text);
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    appendMessage(response, 'bot-message');
  } catch (err) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    appendMessage("Sorry, I am having trouble connecting to the backend server.", 'bot-message');
  }
}

function appendMessage(text, className) {
  const messagesContainer = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${className}`;
  
  // Basic markdown formatting for bold and line breaks
  let formattedText = text;
  if(className === 'bot-message') {
    formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br>');
  }

  msgDiv.innerHTML = `<div class="message-bubble">${formattedText}</div>`;
  messagesContainer.appendChild(msgDiv);
  
  // Auto scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getChatResponse(inputText) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: inputText })
    });
    
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Chat API error:", error);
    // Fallback to local data if server is down or returns error
    const lowerText = inputText.toLowerCase();
    for (const item of indianElectionData.chatKnowledgeBase) {
      if (item.keywords.some(kw => lowerText.includes(kw))) {
        return item.response;
      }
    }
    throw error;
  }
}

