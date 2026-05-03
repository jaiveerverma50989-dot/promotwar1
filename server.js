const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security: remove fingerprinting header
app.disable('x-powered-by');

// Serve static files with long-lived cache for assets
app.use(express.static(__dirname, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));
app.use(express.json({ limit: '16kb' })); // guard against large payloads
app.use(cors());

// Rate limiting: max 30 AI requests per IP per 10 minutes
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' },
});

// In-memory response cache: key = lowercased message, value = { text, expires }
const responseCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Initialize Gemini API
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'AI API key not configured. Using local fallback.' });
    }

    // Serve from cache if available and not expired
    const cacheKey = message.trim().toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return res.json({ response: cached.text, cached: true });
    }

    const prompt = `You are a helpful and knowledgeable assistant specifically designed to help Indian citizens understand the election process.
User's query: ${message.trim()}

Provide a concise, accurate, and easy-to-understand response focused on the Indian Election System. Use markdown formatting if necessary. Keep it under 150 words.`;

    // Enforce a 10-second timeout on AI calls
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), 10000)
    );

    const aiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const text = response.text;

    // Cache the successful response
    responseCache.set(cacheKey, { text, expires: Date.now() + CACHE_TTL_MS });
    // Evict oldest entries if cache grows too large (>200 entries)
    if (responseCache.size > 200) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }

    res.json({ response: text });
  } catch (error) {
    console.error('Error with AI generation:', error.message);
    const statusCode = error.message === 'AI request timed out' ? 504 : 500;
    res.status(statusCode).json({ error: 'Failed to generate a response from the AI.' });
  }
});

// Fallback to index.html for single page app routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not set. Chat will use client-side fallback.');
  }
});
