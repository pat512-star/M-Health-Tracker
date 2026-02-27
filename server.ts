import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PartnerType, SurveyEntry, CoupleProfile, User } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || '8f4b2e9d1c7a5f3b0e6d2c8a4f1b7e3d9c5a0f2b8e4d6c1a7f3b9e5d0c2a8f4b';

app.use(cors());
app.use(express.json());

// In-memory storage (simulating a database)
const couples: CoupleProfile[] = [];
const users: (User & { passwordHash: string })[] = [];
const entries: SurveyEntry[] = [];

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { husbandEmail, wifeEmail, password } = req.body;

  if (!husbandEmail || !wifeEmail || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const existingUser = users.find(u => u.email === husbandEmail || u.email === wifeEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const coupleId = Math.random().toString(36).substr(2, 9);
  const passwordHash = await bcrypt.hash(password, 10);

  const couple: CoupleProfile = {
    id: coupleId,
    husbandEmail,
    wifeEmail,
    startDate: new Date().toISOString()
  };

  const husband: User & { passwordHash: string } = {
    id: Math.random().toString(36).substr(2, 9),
    email: husbandEmail,
    partnerType: PartnerType.HUSBAND,
    coupleId,
    passwordHash
  };

  const wife: User & { passwordHash: string } = {
    id: Math.random().toString(36).substr(2, 9),
    email: wifeEmail,
    partnerType: PartnerType.WIFE,
    coupleId,
    passwordHash
  };

  couples.push(couple);
  users.push(husband, wife);

  const token = jwt.sign({ id: husband.id, coupleId }, JWT_SECRET);
  res.json({ token, user: { id: husband.id, email: husband.email, partnerType: husband.partnerType, coupleId }, couple, entries: [] });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

  const couple = couples.find(c => c.id === user.coupleId);
  const coupleEntries = entries.filter(e => e.coupleId === user.coupleId);

  const token = jwt.sign({ id: user.id, coupleId: user.coupleId }, JWT_SECRET);
  res.json({ 
    token, 
    user: { id: user.id, email: user.email, partnerType: user.partnerType, coupleId: user.coupleId }, 
    couple, 
    entries: coupleEntries
  });
});

// Get Entries
app.get('/api/entries', authenticateToken, (req: any, res) => {
  const coupleEntries = entries.filter(e => e.coupleId === req.user.coupleId);
  res.json(coupleEntries);
});

// Add Entry
app.post('/api/entries', authenticateToken, (req: any, res) => {
  const entry: SurveyEntry = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    coupleId: req.user.coupleId
  };
  entries.push(entry);
  res.json(entry);
});

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
