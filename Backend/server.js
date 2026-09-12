import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './src/config/db.js';
import giveawayRoutes from './src/routes/giveawayRoutes.js';
import participationRoutes from './src/routes/participationRoutes.js';
import winnerRoutes from './src/routes/winnerRoutes.js';
import claimRoutes from './src/routes/claimRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.2:5173',
  ...(process.env.CORS_ORIGINS || process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean)
]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  // Local development on any port (localhost, 127.0.0.1, LAN private IPs)
  if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
    return true;
  }

  // Allow all Vercel deployments (*.vercel.app)
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
      return true;
    }
    if (hostname === 'railway.app' || hostname.endsWith('.railway.app')) {
      return true;
    }
  } catch {
    // Ignore URL parse error
  }

  // Check explicitly allowed origins from environment (or wildcard '*')
  if (allowedOrigins.has(origin) || allowedOrigins.has('*')) {
    return true;
  }

  return false;
};

app.disable('x-powered-by');

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Veloop giveaway API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Veloop Rewards Giveaway API',
    version: '1.0.0',
    status: 'ready'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/giveaways', giveawayRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/claims', claimRoutes);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

startServer();
