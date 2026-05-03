/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Frontend Logic Tests', () => {
  beforeAll(() => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 42, response: "Mocked" })
    });
  });

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
    
    // Inject scripts by ensuring they attach to window
    const dataCode = fs.readFileSync(path.resolve(__dirname, 'data.js'), 'utf8')
      .replace('const indianElectionData', 'window.indianElectionData');
    
    const scriptCode = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8')
      .replace(/const /g, 'var ')
      .replace(/let /g, 'var ');
    
    // Execute in global context
    eval(dataCode);
    eval(scriptCode);
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  test('Navigation switches active views', () => {
    const quizBtn = document.querySelector('.nav-btn[data-target="quiz-view"]');
    const learnView = document.getElementById('learn-view');
    const quizView = document.getElementById('quiz-view');

    expect(learnView.classList.contains('active')).toBe(true);
    quizBtn.click();
    expect(learnView.classList.contains('active')).toBe(false);
    expect(quizView.classList.contains('active')).toBe(true);
  });

  test('Quiz starts correctly', () => {
    const startBtn = document.getElementById('start-quiz-btn');
    const introSection = document.getElementById('quiz-intro');
    const activeSection = document.getElementById('quiz-active');

    startBtn.click();

    expect(introSection.classList.contains('active')).toBe(false);
    expect(activeSection.classList.contains('active')).toBe(true);
    
    const questionText = document.getElementById('quiz-question-text').textContent;
    // Check window.indianElectionData directly
    expect(questionText).toBe(window.indianElectionData.quiz[0].question);
  });

  test('Flashcards flip on click', () => {
    const flashcard = document.getElementById('current-flashcard');
    expect(flashcard.classList.contains('is-flipped')).toBe(false);
    flashcard.click();
    expect(flashcard.classList.contains('is-flipped')).toBe(true);
  });
});
