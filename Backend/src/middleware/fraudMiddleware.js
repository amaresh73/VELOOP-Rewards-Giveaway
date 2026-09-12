export const fraudCheck = (req, res, next) => {
  const { userAgent, ip } = req.headers;

  if (!userAgent || !ip) {
    return res.status(400).json({ success: false, message: 'Missing device intelligence metadata' });
  }

  req.fraudContext = {
    userAgent,
    ip,
    riskScore: 5
  };

  next();
};
