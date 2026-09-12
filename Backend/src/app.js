import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.2:5173',
  ...(process.env.CORS_ORIGINS || process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean)
]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
    return true;
  }

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

  if (allowedOrigins.has(origin) || allowedOrigins.has('*')) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Veloop giveaway API is ready',
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

export default app;
