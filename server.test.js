const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock GoogleGenAI BEFORE requiring app
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: "Mocked AI response about Indian elections."
        })
      }
    }))
  };
});

// Set env var before requiring app
process.env.GEMINI_API_KEY = 'test-key';
const app = require('./server');

describe('Backend API Tests', () => {
  const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');
  let originalSubscribers;

  beforeAll(() => {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      originalSubscribers = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    }
  });

  afterAll(() => {
    if (originalSubscribers) {
      fs.writeFileSync(SUBSCRIBERS_FILE, originalSubscribers);
    } else if (fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.unlinkSync(SUBSCRIBERS_FILE);
    }
  });

  beforeEach(() => {
    // Reset subscribers file for each test
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]));
  });

  test('GET / should return index.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('text/html');
  });

  test('POST /api/chat - Valid Message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'How do I register to vote?' });
    
    // If it still returns 503, it means the mock didn't trigger 'ai' to be truthy
    // but we set process.env.GEMINI_API_KEY before requiring app, so it should be fine.
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('response');
    expect(res.body.response).toContain('Mocked AI response');
  });

  test('POST /api/chat - Empty Message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/subscribe - Valid Email', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ name: 'Test User', email: 'test-' + Date.now() + '@example.com' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Subscribed');
  });

  test('POST /api/subscribe - Duplicate Email', async () => {
    const email = 'duplicate@example.com';
    await request(app).post('/api/subscribe').send({ email });
    const res = await request(app).post('/api/subscribe').send({ email });
    expect(res.body.message).toContain('already subscribed');
  });

  test('GET /api/subscribers/count', async () => {
    const res = await request(app).get('/api/subscribers/count');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.count).toBe('number');
  });
});
