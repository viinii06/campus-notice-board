import crypto from 'node:crypto';
import express from 'express';
import db from './db.js';
import { httpError, sendOtp, verifyOtp } from './minimoth.js';

const app = express();
app.use(express.json());

const PHONE_RE = /^\+[1-9]\d{9,14}$/;
const CATEGORIES = ['General', 'Exams', 'Events', 'Clubs'];

const clean = (value) => String(value ?? '').trim();

function requireAuth(req, res, next) {
  const token = clean(req.headers.authorization).replace(/^Bearer /, '');
  const user = token && db.prepare(
    'SELECT users.id, users.name FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?'
  ).get(token);
  if (!user) throw httpError(401, 'Please log in again.');
  req.user = user;
  next();
}

// 1. Send an OTP to a phone number (used for both login and registration)
app.post('/api/auth/request-otp', async (req, res) => {
  const phone = clean(req.body.phone);
  if (!PHONE_RE.test(phone)) throw httpError(400, 'Use international format, e.g. +919876543210');

  await sendOtp(phone);
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  res.json({ message: 'OTP sent', isNewUser: !existing });
});

// 2. Verify the OTP; registers the user on first login, returns a session token
app.post('/api/auth/verify-otp', async (req, res) => {
  const phone = clean(req.body.phone);
  const code = clean(req.body.code);
  const name = clean(req.body.name);

  if (!PHONE_RE.test(phone)) throw httpError(400, 'Invalid phone number');
  if (!/^\d{4,8}$/.test(code)) throw httpError(400, 'Enter the numeric code you received');

  let user = db.prepare('SELECT id, name FROM users WHERE phone = ?').get(phone);
  if (!user && (name.length < 2 || name.length > 50)) {
    throw httpError(400, 'Name (2–50 characters) is required to register');
  }

  await verifyOtp(phone, code);

  if (!user) {
    const result = db.prepare('INSERT INTO users (phone, name) VALUES (?, ?)').run(phone, name);
    user = { id: Number(result.lastInsertRowid), name };
  }

  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  res.json({ token, user });
});

// 3. List all notices (public)
app.get('/api/notices', (req, res) => {
  const notices = db.prepare(`
    SELECT notices.id, title, body, category, notices.created_at, user_id, users.name AS author
    FROM notices JOIN users ON users.id = notices.user_id
    ORDER BY notices.id DESC
  `).all();
  res.json(notices);
});

// 4. Post a notice
app.post('/api/notices', requireAuth, (req, res) => {
  const title = clean(req.body.title);
  const body = clean(req.body.body);
  const category = clean(req.body.category);

  if (title.length < 3 || title.length > 100) throw httpError(400, 'Title must be 3–100 characters');
  if (body.length < 5 || body.length > 1000) throw httpError(400, 'Details must be 5–1000 characters');
  if (!CATEGORIES.includes(category)) throw httpError(400, `Category must be one of: ${CATEGORIES.join(', ')}`);

  const result = db.prepare('INSERT INTO notices (title, body, category, user_id) VALUES (?, ?, ?, ?)')
    .run(title, body, category, req.user.id);
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

// 5. Delete your own notice
app.delete('/api/notices/:id', requireAuth, (req, res) => {
  const notice = db.prepare('SELECT user_id FROM notices WHERE id = ?').get(Number(req.params.id));
  if (!notice) throw httpError(404, 'Notice not found');
  if (notice.user_id !== req.user.id) throw httpError(403, 'You can only delete your own notices');

  db.prepare('DELETE FROM notices WHERE id = ?').run(Number(req.params.id));
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Errors from routes (including async ones, handled by Express 5) end up here
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
