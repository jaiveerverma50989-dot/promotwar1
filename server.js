const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const dotenv     = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const rateLimit  = require('express-rate-limit');
const nodemailer = require('nodemailer');
const cron       = require('node-cron');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 8080;

// ── Security ────────────────────────────────────────────────
app.disable('x-powered-by');

// ── Static files ─────────────────────────────────────────────
app.use(express.static(__dirname, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(cors());

// ── Rate limiters ─────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { error: 'Too many submissions. Please try again later.' },
});

// ── Gemini AI ─────────────────────────────────────────────────
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// ── In-memory chat cache (5 min TTL) ─────────────────────────
const responseCache = new Map();
const CACHE_TTL_MS  = 5 * 60 * 1000;

// ── Nodemailer transporter ────────────────────────────────────
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  transporter.verify(err => {
    if (err) console.warn('Email transporter error:', err.message);
    else     console.log('Email transporter ready ✓');
  });
} else {
  console.warn('WARNING: EMAIL_USER/EMAIL_PASS not set. Emails will be logged only.');
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"VoterBuddy India" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
}

// ── Subscriber store (JSON file) ──────────────────────────────
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

function loadSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE))
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
  } catch { /* ignore */ }
  return [];
}

function saveSubscribers(list) {
  try { fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2)); }
  catch (e) { console.error('Could not save subscribers:', e.message); }
}

// ── Reminder email template ───────────────────────────────────
function reminderHtml(name) {
  return `
  <div style="font-family:Inter,sans-serif;background:#0b0f19;color:#f8fafc;padding:32px;border-radius:12px;max-width:600px;margin:auto">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="background:linear-gradient(90deg,#FF9933,#fff,#138808);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2rem;margin:0">
        🗳️ VoterBuddy India
      </h1>
      <p style="color:#94a3b8;margin-top:4px">Your Election Reminder</p>
    </div>
    <p>Namaste ${name || 'Citizen'} 🙏,</p>
    <p>This is your automated reminder from <strong>VoterBuddy India</strong>. Stay informed and exercise your democratic right!</p>
    <div style="background:#1e293b;border-left:4px solid #FF9933;border-radius:8px;padding:16px;margin:20px 0">
      <h3 style="color:#FF9933;margin:0 0 8px">📋 Citizen Action Checklist</h3>
      <ul style="color:#94a3b8;padding-left:20px;line-height:2">
        <li>✅ Verify your name on the Electoral Roll</li>
        <li>✅ Keep your Voter ID (EPIC) handy</li>
        <li>✅ Know your polling booth location</li>
        <li>✅ Check upcoming election dates at eci.gov.in</li>
      </ul>
    </div>
    <p style="color:#94a3b8;font-size:0.85rem;margin-top:24px;border-top:1px solid #334155;padding-top:16px">
      ECI Helpline: <strong>1950</strong> (Toll Free) &nbsp;|&nbsp;
      <a href="https://voters.eci.gov.in" style="color:#FF9933">voters.eci.gov.in</a>
    </p>
    <p style="color:#475569;font-size:0.75rem">You are receiving this because you subscribed on VoterBuddy India. Every vote counts. 🇮🇳</p>
  </div>`;
}

// ── CRON: Send reminders to all subscribers every Monday 9 AM ─
cron.schedule('0 9 * * 1', async () => {
  const subscribers = loadSubscribers();
  if (!subscribers.length) return;
  console.log(`[CRON] Sending weekly reminders to ${subscribers.length} subscribers...`);
  for (const sub of subscribers) {
    try {
      await sendEmail({
        to:      sub.email,
        subject: '🗳️ Weekly Election Reminder — VoterBuddy India',
        html:    reminderHtml(sub.name),
      });
    } catch (e) {
      console.error(`Failed to send reminder to ${sub.email}:`, e.message);
    }
  }
  console.log('[CRON] Weekly reminders sent ✓');
}, { timezone: 'Asia/Kolkata' });

// ═══════════════════════════════════════════════════════════════
//  API Routes
// ═══════════════════════════════════════════════════════════════

// ── POST /api/subscribe ───────────────────────────────────────
app.post('/api/subscribe', contactLimiter, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const subscribers = loadSubscribers();
  if (subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.json({ message: 'You are already subscribed for reminders!' });
  }

  subscribers.push({ name: name || 'Citizen', email, phone: phone || '', subscribedAt: new Date().toISOString() });
  saveSubscribers(subscribers);

  // Send instant welcome reminder
  try {
    await sendEmail({
      to:      email,
      subject: '🗳️ Welcome to VoterBuddy India — Reminders Activated!',
      html:    reminderHtml(name),
    });
  } catch (e) {
    console.warn('Welcome email failed:', e.message);
  }

  res.json({ message: `Subscribed! You'll receive weekly election reminders at ${email}.` });
});

// ── POST /api/contact ─────────────────────────────────────────
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (adminEmail) {
    try {
      await sendEmail({
        to:      adminEmail,
        subject: `[VoterBuddy Contact] ${subject || 'New Message'} — from ${name}`,
        html: `
          <div style="font-family:Inter,sans-serif;padding:24px">
            <h2>New Contact Submission</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;color:#666">Name</td><td style="padding:8px"><strong>${name}</strong></td></tr>
              <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${email}</td></tr>
              <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px">${phone || '—'}</td></tr>
              <tr><td style="padding:8px;color:#666">Subject</td><td style="padding:8px">${subject || '—'}</td></tr>
              <tr><td style="padding:8px;color:#666;vertical-align:top">Message</td><td style="padding:8px">${message}</td></tr>
            </table>
          </div>`,
      });
    } catch (e) {
      console.warn('Admin notification email failed:', e.message);
    }
  } else {
    console.log(`[CONTACT] ${name} <${email}>: ${message}`);
  }

  res.json({ message: 'Your message has been received. We will get back to you shortly!' });
});

// ── POST /api/chat ────────────────────────────────────────────
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (!ai) {
    return res.status(503).json({ error: 'AI API key not configured. Using local fallback.' });
  }

  const cacheKey = message.trim().toLowerCase();
  const cached   = responseCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return res.json({ response: cached.text, cached: true });
  }

  try {
    const prompt = `You are a helpful assistant for Indian citizens about the election process.\nUser query: ${message.trim()}\n\nGive a concise, accurate response about the Indian Election System. Use markdown if needed. Max 150 words.`;
    const timeout = new Promise((_, r) => setTimeout(() => r(new Error('AI request timed out')), 10000));
    const result  = await Promise.race([
      ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }),
      timeout,
    ]);
    const text = result.text;
    responseCache.set(cacheKey, { text, expires: Date.now() + CACHE_TTL_MS });
    if (responseCache.size > 200) responseCache.delete(responseCache.keys().next().value);
    res.json({ response: text });
  } catch (error) {
    console.error('AI error:', error.message);
    res.status(error.message === 'AI request timed out' ? 504 : 500)
       .json({ error: 'Failed to generate a response.' });
  }
});

// ── GET /api/subscribers/count (public stats) ─────────────────
app.get('/api/subscribers/count', (req, res) => {
  const count = loadSubscribers().length;
  res.json({ count });
});

// ── Fallback ──────────────────────────────────────────────────
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    const subs = loadSubscribers();
    console.log(`Loaded ${subs.length} existing subscriber(s).`);
    if (!process.env.GEMINI_API_KEY)  console.warn('WARNING: GEMINI_API_KEY not set.');
    if (!process.env.EMAIL_USER)      console.warn('WARNING: EMAIL_USER not set — emails will be logged only.');
  });
}

module.exports = app;
