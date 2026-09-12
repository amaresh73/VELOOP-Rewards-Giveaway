export const rateLimiter = ({ max = 10, windowMs = 60000, message = 'Too many requests. Please try again later.' } = {}) => (req, res, next) => {
  const now = Date.now();
  const clientKey = req.headers['x-client-id'] || req.ip || 'unknown';
  const key = `${clientKey}:${req.originalUrl}`;

  if (!globalThis.__rateLimitMap) {
    globalThis.__rateLimitMap = new Map();
  }

  const current = globalThis.__rateLimitMap.get(key) || [];
  const recent = current.filter((timestamp) => timestamp > now - windowMs);

  if (recent.length >= max) {
    return res.status(429).json({ success: false, code: 'RATE_LIMITED', message });
  }

  recent.push(now);
  globalThis.__rateLimitMap.set(key, recent);
  next();
};
