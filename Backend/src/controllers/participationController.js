import Giveaway from '../models/Giveaway.js';
import GiveawayParticipation from '../models/GiveawayParticipation.js';
import GiveawayEntryTransaction from '../models/GiveawayEntryTransaction.js';
import DeviceParticipation from '../models/DeviceParticipation.js';
import AuditLog from '../models/AuditLog.js';
import { validateWalletBalance, deductWalletBalance, reverseWalletBalance } from '../services/balanceService.js';
import { createDeviceHash, evaluateFraudRisk, recordFraudEvent, getDeviceParticipationState } from '../services/fraudService.js';

export const joinGiveaway = async (req, res) => {
  try {
    const { giveawayId, requestKey } = req.body;
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ success: false, message: 'Authentication required to participate.' });
    }

    if (!giveawayId) {
      return res.status(400).json({ success: false, message: 'giveawayId is required' });
    }

    const userId = authenticatedUser.id || authenticatedUser._id;
    const bodyUserId = req.body.userId;
    const deviceHash = createDeviceHash({ value: req.headers['x-device-id'] || `${req.ip || 'unknown'}|${req.headers['user-agent'] || 'unknown'}` });
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (bodyUserId && bodyUserId !== userId) {
      const risk = await evaluateFraudRisk({
        userId,
        giveawayId,
        deviceHash,
        ipAddress,
        userAgent,
        signals: ['multi_account', 'device_match']
      });
      await recordFraudEvent({
        userId,
        giveawayId,
        deviceHash,
        eventType: 'UNAUTHORIZED',
        reason: 'Frontend attempted to override the authenticated user identity.',
        severity: 'HIGH',
        ipAddress,
        userAgent,
        signals: risk.signals,
        riskScore: risk.riskScore,
        action: risk.action
      });
      return res.status(403).json({ success: false, message: 'User identity mismatch.' });
    }

    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) {
      return res.status(404).json({ success: false, message: 'GIVEAWAY_NOT_FOUND' });
    }

    const now = new Date();
    const startAt = giveaway.startsAt || new Date(Date.now() - 60 * 60 * 1000);
    const endAt = giveaway.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (now < startAt) {
      return res.status(400).json({ success: false, message: 'GIVEAWAY_UPCOMING' });
    }

    if (now > endAt) {
      return res.status(400).json({ success: false, message: 'GIVEAWAY_ENDED' });
    }

    const normalizedStatus = String(giveaway.status || 'ACTIVE').toUpperCase();
    if (!['ACTIVE', 'LIVE', 'ENDING-SOON'].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: 'GIVEAWAY_NOT_ACTIVE' });
    }

    const requestKeyValue = requestKey || `${userId}:${giveawayId}:${Date.now()}`;
    const existingIdempotency = await GiveawayEntryTransaction.findOne({ userId, giveawayId, requestKey: requestKeyValue }).lean();
    if (existingIdempotency) {
      const risk = await evaluateFraudRisk({ userId, giveawayId, deviceHash, ipAddress, userAgent, signals: ['repeated_attempt'] });
      await recordFraudEvent({ userId, giveawayId, deviceHash, eventType: 'DUPLICATE_REQUEST', reason: 'Repeated participation request detected.', severity: 'HIGH', ipAddress, userAgent, signals: risk.signals, riskScore: risk.riskScore, action: risk.action });
      return res.status(409).json({ success: false, message: 'DUPLICATE_REQUEST' });
    }

    const existingParticipation = await GiveawayParticipation.findOne({ userId, giveawayId }).lean();
    if (existingParticipation) {
      const risk = await evaluateFraudRisk({ userId, giveawayId, deviceHash, ipAddress, userAgent, signals: ['repeated_attempt', 'device_match'] });
      await recordFraudEvent({ userId, giveawayId, deviceHash, eventType: 'DUPLICATE_REQUEST', reason: 'User attempted duplicate participation for the same giveaway.', severity: 'HIGH', ipAddress, userAgent, signals: risk.signals, riskScore: risk.riskScore, action: risk.action });
      return res.status(409).json({ success: false, message: 'PARTICIPATION_ALREADY_EXISTS' });
    }

    const previousDeviceState = deviceHash ? await getDeviceParticipationState({ giveawayId, deviceHash }) : null;
    if (previousDeviceState && previousDeviceState.userId !== userId) {
      const risk = await evaluateFraudRisk({ userId, giveawayId, deviceHash, ipAddress, userAgent, signals: ['device_match', 'multi_account'] });
      await recordFraudEvent({
        userId,
        giveawayId,
        deviceHash,
        eventType: 'DEVICE_MATCH',
        reason: 'A different account attempted to use a previously seen device for the same giveaway.',
        severity: 'HIGH',
        ipAddress,
        userAgent,
        signals: risk.signals,
        riskScore: risk.riskScore,
        action: risk.action
      });
      return res.status(409).json({ success: false, message: 'SAME_DEVICE_PARTICIPATION_BLOCKED' });
    }

    const entryRequirement = giveaway.entryRequirement || { currency: 'VEs', amount: 250 };
    const requiredAmount = Number(entryRequirement.amount || 0);
    const requiredCurrency = entryRequirement.currency || 'VEs';

    const balanceValidation = await validateWalletBalance({ userId, requiredPoints: requiredAmount, currency: requiredCurrency });
    if (!balanceValidation.success) {
      const risk = await evaluateFraudRisk({ userId, giveawayId, deviceHash, ipAddress, userAgent, signals: ['repeated_attempt'] });
      await recordFraudEvent({
        userId,
        giveawayId,
        deviceHash,
        eventType: 'INSUFFICIENT_BALANCE',
        reason: `Insufficient ${requiredCurrency} to participate in the giveaway.`,
        severity: 'MEDIUM',
        ipAddress,
        userAgent,
        metadata: { requiredCurrency, requiredAmount, balance: balanceValidation.balance },
        signals: risk.signals,
        riskScore: risk.riskScore,
        action: risk.action
      });
      return res.status(400).json({
        success: false,
        message: `INSUFFICIENT_${requiredCurrency}`,
        data: {
          requiredCurrency,
          requiredAmount,
          balance: balanceValidation.balance,
          missing: requiredAmount - balanceValidation.balance
        }
      });
    }

    const fromSameDevice = deviceHash ? await DeviceParticipation.findOne({ giveawayId, deviceHash, userId }).lean() : null;
    if (deviceHash && !fromSameDevice) {
      await DeviceParticipation.create({ giveawayId, deviceHash, userId, status: 'ACTIVE', riskScore: 0, reason: 'Participation created' });
    }

    const deductionResult = await deductWalletBalance({ userId, currency: requiredCurrency, amount: requiredAmount });
    if (!deductionResult.success) {
      return res.status(400).json({ success: false, message: `INSUFFICIENT_${requiredCurrency}` });
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

    let participation;
    try {
      participation = await GiveawayParticipation.create({
        userId,
        giveawayId,
        status: 'joined',
        entryCount: 1,
        deviceHash,
        entryCurrency: requiredCurrency,
        entryAmount: requiredAmount,
        currency: requiredCurrency,
        amount: requiredAmount,
        transactionId,
        requestKey: requestKeyValue
      });
    } catch (error) {
      if (error.code === 11000) {
        const reversal = await reverseWalletBalance({ userId, currency: requiredCurrency, amount: requiredAmount });
        await GiveawayEntryTransaction.create({
          userId,
          giveawayId,
          prizeId: giveaway.prize || 'giveaway-prize',
          currency: requiredCurrency,
          amount: requiredAmount,
          type: 'REVERSAL',
          status: 'REVERSED',
          balanceBefore: reversal.balanceAfter - requiredAmount,
          balanceAfter: reversal.balanceAfter,
          transactionId: `REV-${transactionId}`,
          relatedTransactionId: transactionId,
          requestKey: requestKeyValue,
          metadata: { reason: 'Duplicate participation race compensation' }
        });
        return res.status(409).json({ success: false, message: 'PARTICIPATION_ALREADY_EXISTS' });
      }
      throw error;
    }

    try {
      await GiveawayEntryTransaction.create({
        userId,
        giveawayId,
        prizeId: giveaway.prize || 'giveaway-prize',
        currency: requiredCurrency,
        amount: requiredAmount,
        type: 'ENTRY_DEBIT',
        status: 'SUCCESS',
        balanceBefore: deductionResult.balanceBefore,
        balanceAfter: deductionResult.balanceAfter,
        transactionId,
        requestKey: requestKeyValue,
        metadata: {
          giveawayTitle: giveaway.title,
          status: giveaway.status
        }
      });
    } catch (error) {
      await GiveawayParticipation.deleteOne({ _id: participation._id });
      await DeviceParticipation.deleteOne({ giveawayId, deviceHash, userId });
      await reverseWalletBalance({ userId, currency: requiredCurrency, amount: requiredAmount });
      throw error;
    }

    await AuditLog.create({
      entityType: 'GiveawayParticipation',
      entityId: String(participation._id),
      action: 'JOIN_GIVEAWAY',
      performedBy: userId,
      userId,
      giveawayId: String(giveawayId),
      amount: requiredAmount,
      currency: requiredCurrency,
      result: 'SUCCESS',
      requestId: requestKeyValue,
      metadata: { deviceHash, ipAddress, userAgent }
    });

    let updatedGiveaway = null;
    try {
      updatedGiveaway = await Giveaway.findByIdAndUpdate(
        giveawayId,
        { $inc: { entries: 1, participants: 1 } },
        { new: true }
      ).lean();
    } catch {
      // non-blocking
    }

    return res.status(201).json({
      success: true,
      message: 'Participation recorded successfully',
      data: {
        participation,
        transaction: {
          transactionId,
          currency: requiredCurrency,
          amount: requiredAmount,
          balanceBefore: deductionResult.balanceBefore,
          balanceAfter: deductionResult.balanceAfter
        },
        wallet: {
          balances: deductionResult.balances,
          currency: requiredCurrency,
          remaining: deductionResult.balanceAfter
        },
        giveaway: {
          id: giveawayId,
          participants: updatedGiveaway?.participants || (giveaway.participants + 1),
          entries: updatedGiveaway?.entries || (giveaway.entries + 1)
        },
        giveawayId,
        userId,
        status: 'joined'
      }
    });
  } catch (error) {
    console.error('joinGiveaway error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'PARTICIPATION_ALREADY_EXISTS' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Unable to process participation.' });
  }
};
