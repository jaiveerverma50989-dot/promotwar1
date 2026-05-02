const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());

// Initialize Gemini API (will throw if API key is missing, so we wrap it gracefully later)
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!ai) {
      // Return 503 Service Unavailable so the frontend uses its local fallback
      return res.status(503).json({ error: 'AI API key not configured. Using local fallback.' });
    }

    const prompt = `You are a helpful and knowledgeable assistant specifically designed to help Indian citizens understand the election process. 
User's query: ${message}

Provide a concise, accurate, and easy-to-understand response focused on the Indian Election System. Use markdown formatting if necessary. Keep it under 150 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ response: response.text });
  } catch (error) {
    console.error('Error with AI generation:', error);
    res.status(500).json({ error: 'Failed to generate a response from the AI.' });
  }
});

// Fallback to index.html for single page app routing if needed
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set. The Chat Assistant will use simulated responses.");
  }
});
