// ============================================================
//  Cached DOM References  (queried once, never inside loops)
// ============================================================
const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  DOM.navBtns = document.querySelectorAll('.nav-btn');
  DOM.views   = document.querySelectorAll('.view');

  // Process
  DOM.processContainer = document.getElementById('process-container');

  // Flashcards
  DOM.flashcard  = document.getElementById('current-flashcard');
  DOM.fcTerm     = document.getElementById('fc-term');
  DOM.fcDef      = document.getElementById('fc-def');
  DOM.fcCounter  = document.getElementById('fc-counter');
  DOM.fcPrev     = document.getElementById('fc-prev');
  DOM.fcNext     = document.getElementById('fc-next');

  // Quiz
  DOM.quizIntro       = document.getElementById('quiz-intro');
  DOM.quizActive      = document.getElementById('quiz-active');
  DOM.quizResults     = document.getElementById('quiz-results');
  DOM.quizProgressTxt = document.getElementById('quiz-progress-text');
  DOM.quizProgressBar = document.getElementById('quiz-progress-fill');
  DOM.quizQuestion    = document.getElementById('quiz-question-text');
  DOM.quizOptions     = document.getElementById('quiz-options');
  DOM.quizFeedback    = document.getElementById('quiz-feedback');
  DOM.feedbackText    = document.getElementById('feedback-text');
  DOM.explanationText = document.getElementById('explanation-text');
  DOM.nextQBtn        = document.getElementById('next-q-btn');
  DOM.finalScore      = document.getElementById('final-score');
  DOM.totalQuestions  = document.getElementById('total-questions');
  DOM.scoreMessage    = document.getElementById('score-message');

  // Chat
  DOM.chatMessages    = document.getElementById('chat-messages');
  DOM.chatInput       = document.getElementById('chat-input');
  DOM.chatSendBtn     = document.getElementById('chat-send-btn');
  DOM.suggestionChips = document.querySelectorAll('.suggestion-chip');

  // Contact
  DOM.contactForm       = document.getElementById('contact-form');
  DOM.contactSubmitBtn  = document.getElementById('contact-submit-btn');
  DOM.contactStatus     = document.getElementById('contact-form-status');
  DOM.subscribeForm     = document.getElementById('subscribe-form');
  DOM.subscribeBtn      = document.getElementById('subscribe-btn');
  DOM.subscribeStatus   = document.getElementById('subscribe-status');
  DOM.subscriberCount   = document.getElementById('subscriber-count');

  initNavigation();
  initProcessTimeline();
  initFlashcards();
  initQuiz();
  initChat();
  initContact();
});

// ============================================================
//  Navigation
// ============================================================
function initNavigation() {
  DOM.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-target');
      DOM.views.forEach(v => v.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// ============================================================
//  Process Timeline  (batch DOM insertion via DocumentFragment)
// ============================================================
function initProcessTimeline() {
  const fragment = document.createDocumentFragment();

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
    fragment.appendChild(el);
  });

  DOM.processContainer.appendChild(fragment); // single reflow
}

// ============================================================
//  Flashcards
// ============================================================
let currentFlashcardIndex = 0;

function initFlashcards() {
  DOM.flashcard.addEventListener('click', () => {
    DOM.flashcard.classList.toggle('is-flipped');
  });

  DOM.fcPrev.addEventListener('click', () => {
    if (currentFlashcardIndex > 0) {
      currentFlashcardIndex--;
      updateFlashcardUI();
    }
  });

  DOM.fcNext.addEventListener('click', () => {
    if (currentFlashcardIndex < indianElectionData.flashcards.length - 1) {
      currentFlashcardIndex++;
      updateFlashcardUI();
    }
  });

  updateFlashcardUI();
}

function updateFlashcardUI() {
  DOM.flashcard.classList.remove('is-flipped');

  // Wait for CSS flip-reset animation before updating text
  setTimeout(() => {
    const cardData = indianElectionData.flashcards[currentFlashcardIndex];
    DOM.fcTerm.textContent    = cardData.term;
    DOM.fcDef.textContent     = cardData.definition;
    DOM.fcCounter.textContent = `${currentFlashcardIndex + 1} / ${indianElectionData.flashcards.length}`;

    const atStart = currentFlashcardIndex === 0;
    const atEnd   = currentFlashcardIndex === indianElectionData.flashcards.length - 1;

    DOM.fcPrev.disabled      = atStart;
    DOM.fcNext.disabled      = atEnd;
    DOM.fcPrev.style.opacity = atStart ? '0.5' : '1';
    DOM.fcNext.style.opacity = atEnd   ? '0.5' : '1';
  }, 150);
}

// ============================================================
//  Quiz
// ============================================================
let currentQuestionIndex = 0;
let score = 0;

function initQuiz() {
  document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
  DOM.nextQBtn.addEventListener('click', nextQuestion);
  document.getElementById('restart-quiz-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    startQuiz();
  });
}

function startQuiz() {
  DOM.quizIntro.classList.remove('active');
  DOM.quizResults.classList.remove('active');
  DOM.quizActive.classList.add('active');
  loadQuestion();
}

function loadQuestion() {
  const qData = indianElectionData.quiz[currentQuestionIndex];
  const total  = indianElectionData.quiz.length;

  DOM.quizProgressTxt.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  DOM.quizProgressBar.style.width = `${(currentQuestionIndex / total) * 100}%`;
  DOM.quizQuestion.textContent    = qData.question;

  // Batch option rendering via DocumentFragment
  const fragment = document.createDocumentFragment();
  qData.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(index, btn));
    fragment.appendChild(btn);
  });
  DOM.quizOptions.innerHTML = '';
  DOM.quizOptions.appendChild(fragment);

  DOM.quizFeedback.classList.add('hidden');
}

function selectAnswer(selectedIndex, selectedBtn) {
  const qData   = indianElectionData.quiz[currentQuestionIndex];
  const allBtns = DOM.quizOptions.querySelectorAll('.option-btn');

  allBtns.forEach(btn => (btn.disabled = true));

  const isCorrect = selectedIndex === qData.correctIndex;

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    score++;
  } else {
    selectedBtn.classList.add('incorrect');
    allBtns[qData.correctIndex].classList.add('correct');
  }

  DOM.quizFeedback.classList.remove('hidden');
  DOM.feedbackText.textContent    = isCorrect ? 'Correct!' : 'Incorrect.';
  DOM.feedbackText.className      = isCorrect ? 'correct-text' : 'incorrect-text';
  DOM.explanationText.textContent = qData.explanation;

  DOM.nextQBtn.textContent =
    currentQuestionIndex === indianElectionData.quiz.length - 1
      ? 'See Results'
      : 'Next Question';
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
  DOM.quizActive.classList.remove('active');
  DOM.quizResults.classList.add('active');

  const total = indianElectionData.quiz.length;
  DOM.finalScore.textContent    = score;
  DOM.totalQuestions.textContent = total;
  DOM.quizProgressBar.style.width = '100%';

  if (score === total) {
    DOM.scoreMessage.textContent = 'Outstanding! You are a democratic champion!';
  } else if (score >= total / 2) {
    DOM.scoreMessage.textContent = 'Good job! You have a solid grasp of the system.';
  } else {
    DOM.scoreMessage.textContent = 'Keep learning! Democracy relies on informed citizens.';
  }
}

// ============================================================
//  Chat
// ============================================================
let isSending = false; // guard against double-send

function initChat() {
  DOM.chatSendBtn.addEventListener('click', handleSendMessage);
  DOM.chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSendMessage();
  });

  DOM.suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      DOM.chatInput.value = chip.textContent;
      handleSendMessage();
    });
  });
}

async function handleSendMessage() {
  if (isSending) return; // prevent double-send

  const text = DOM.chatInput.value.trim();
  if (!text) return;

  isSending = true;
  DOM.chatSendBtn.disabled = true;

  appendMessage(text, 'user-message');
  DOM.chatInput.value = '';

  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message';
  typingDiv.id        = 'typing-indicator';
  typingDiv.innerHTML = `<div class="message-bubble"><em>Thinking...</em></div>`;
  DOM.chatMessages.appendChild(typingDiv);
  DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;

  try {
    const response = await getChatResponse(text);
    document.getElementById('typing-indicator')?.remove();
    appendMessage(response, 'bot-message');
  } catch {
    document.getElementById('typing-indicator')?.remove();
    appendMessage('Sorry, I am having trouble connecting to the backend server.', 'bot-message');
  } finally {
    isSending = false;
    DOM.chatSendBtn.disabled = false;
    DOM.chatInput.focus();
  }
}

function appendMessage(text, className) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${className}`;

  let formattedText = text;
  if (className === 'bot-message') {
    formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  msgDiv.innerHTML = `<div class="message-bubble">${formattedText}</div>`;
  DOM.chatMessages.appendChild(msgDiv);
  DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

async function getChatResponse(inputText) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputText }),
    });
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.warn('Chat API unavailable, falling back to local KB:', error.message);
    const lowerText = inputText.toLowerCase();
    for (const item of indianElectionData.chatKnowledgeBase) {
      if (item.keywords.some(kw => lowerText.includes(kw))) return item.response;
    }
    throw new Error('No match in local knowledge base');
  }
}

// ============================================================
//  Contact & Reminder Subscription
// ============================================================
function initContact() {
  // Load live subscriber count
  fetch('/api/subscribers/count')
    .then(r => r.json())
    .then(data => {
      if (DOM.subscriberCount) DOM.subscriberCount.textContent = data.count.toLocaleString();
    })
    .catch(() => {});

  // Contact form
  if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = document.getElementById('contact-name').value.trim();
      const email   = document.getElementById('contact-email').value.trim();
      const phone   = document.getElementById('contact-phone').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        showFormStatus(DOM.contactStatus, 'Please fill in all required fields.', 'error');
        return;
      }

      DOM.contactSubmitBtn.disabled = true;
      DOM.contactSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      try {
        const res  = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, subject, message }),
        });
        const data = await res.json();
        if (res.ok) {
          showFormStatus(DOM.contactStatus, data.message, 'success');
          DOM.contactForm.reset();
        } else {
          showFormStatus(DOM.contactStatus, data.error || 'Something went wrong.', 'error');
        }
      } catch {
        showFormStatus(DOM.contactStatus, 'Could not connect to server. Please try again.', 'error');
      } finally {
        DOM.contactSubmitBtn.disabled = false;
        DOM.contactSubmitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      }
    });
  }

  // Subscribe form
  if (DOM.subscribeForm) {
    DOM.subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name  = document.getElementById('sub-name').value.trim();
      const email = document.getElementById('sub-email').value.trim();
      const phone = document.getElementById('sub-phone').value.trim();

      if (!email) {
        showFormStatus(DOM.subscribeStatus, 'Please enter your email address.', 'error');
        return;
      }

      DOM.subscribeBtn.disabled = true;
      DOM.subscribeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...';

      try {
        const res  = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone }),
        });
        const data = await res.json();
        if (res.ok) {
          showFormStatus(DOM.subscribeStatus, data.message, 'success');
          DOM.subscribeForm.reset();
          // Update count
          fetch('/api/subscribers/count').then(r=>r.json()).then(d=>{
            if (DOM.subscriberCount) DOM.subscriberCount.textContent = d.count.toLocaleString();
          }).catch(()=>{});
        } else {
          showFormStatus(DOM.subscribeStatus, data.error || 'Something went wrong.', 'error');
        }
      } catch {
        showFormStatus(DOM.subscribeStatus, 'Could not connect. Please try again.', 'error');
      } finally {
        DOM.subscribeBtn.disabled = false;
        DOM.subscribeBtn.innerHTML = '<i class="fa-solid fa-bell"></i> Subscribe for Reminders';
      }
    });
  }
}

function showFormStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `form-status ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 6000);
}
