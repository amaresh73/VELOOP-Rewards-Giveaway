import crypto from 'crypto';
import FraudEvent from '../models/FraudEvent.js';
import DeviceParticipation from '../models/DeviceParticipation.js';

export const createDeviceHash = ({ value }) => {
  if (!value) return null;
  return crypto.createHash('sha256').update(String(value).trim()).digest('hex');
};

export const calculateRiskScore = ({ signals = [] }) => {
  const score = signals.reduce((sum, signal) => sum + (signal === 'device_match' ? 25 : signal === 'repeated_attempt' ? 20 : signal === 'ip_shared' ? 15 : signal === 'rapid_submit' ? 18 : signal === 'multi_account' ? 30 : 10), 0);
  return Math.max(0, Math.min(100, score));
};

export const evaluateFraudRisk = async ({ userId, giveawayId, deviceHash, ipAddress, userAgent, signals = [] }) => {
  const riskScore = calculateRiskScore({ signals });
  const normalized = signals.map((signal) => signal.toString());

  let status = 'LOW';
  if (riskScore >= 80) status = 'CRITICAL';
  else if (riskScore >= 60) status = 'HIGH';
  else if (riskScore >= 30) status = 'MEDIUM';

  return {
    riskScore,
    status,
    signals: normalized,
    action: riskScore >= 60 ? 'BLOCKED' : riskScore >= 30 ? 'FLAGGED' : 'ALLOWED'
  };
};

export const recordFraudEvent = async ({ userId, giveawayId, deviceHash, eventType, reason, severity = 'MEDIUM', ipAddress, userAgent, metadata = {}, signals = [], riskScore = 0, action = 'FLAGGED' }) => {
  try {
    const fraud = await FraudEvent.create({
      userId,
      giveawayId,
      deviceHash,
      eventType,
      riskScore,
      reason,
      severity,
      action,
      ipAddress,
      userAgent,
      signals,
      metadata
    });

    if (deviceHash && giveawayId) {
      await DeviceParticipation.findOneAndUpdate(
        { giveawayId, deviceHash, userId },
        {
          giveawayId,
          deviceHash,
          userId,
          status: action === 'BLOCKED' ? 'BLOCKED' : action === 'FLAGGED' ? 'REVIEW' : 'ACTIVE',
          riskScore,
          reason,
          metadata: { ...metadata, lastSeenAt: new Date().toISOString() }
        },
        { upsert: true, new: true }
      );
    }

    return fraud;
  } catch (error) {
    console.warn('Fraud logging failed:', error.message);
    return null;
  }
};

export const isUserSuspicious = async ({ userId }) => {
  if (!userId) return false;

  const recentEvents = await FraudEvent.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }
  });

  return recentEvents >= 3;
};

export const getDeviceParticipationState = async ({ giveawayId, deviceHash }) => {
  if (!giveawayId || !deviceHash) return null;
  return DeviceParticipation.findOne({ giveawayId, deviceHash }).lean();
};
