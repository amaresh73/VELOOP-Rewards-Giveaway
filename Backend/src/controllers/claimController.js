import PrizeClaim from '../models/PrizeClaim.js';
import GiveawayWinner from '../models/GiveawayWinner.js';
import AuditLog from '../models/AuditLog.js';
import Prize from '../models/Prize.js';

export const createClaim = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userId = authenticatedUser.id || authenticatedUser._id;
    const { giveawayId, prizeId, winnerId, type, name, phone, address, city, state, pin, email } = req.body;

    if (!giveawayId) {
      return res.status(400).json({ success: false, message: 'giveawayId is required' });
    }

    const winner = await GiveawayWinner.findOne({ _id: winnerId || undefined, giveawayId, userId }).lean();
    if (!winner) {
      return res.status(403).json({ success: false, message: 'Only the authorized winner may claim this prize.' });
    }

    const prize = winner.prizeId ? await Prize.findById(winner.prizeId).lean() : null;
    const resolvedType = prize?.type === 'gift-card' ? 'gift-card' : type || prize?.type || 'physical';

    const existingClaim = await PrizeClaim.findOne({ winnerId: winner._id }).lean();
    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'CLAIM_ALREADY_SUBMITTED' });
    }

    if (resolvedType === 'physical') {
      if (!name || !phone || !address || !city || !state || !pin) {
        return res.status(400).json({ success: false, message: 'Physical claims require name, phone, address, city, state and PIN.' });
      }
    }

    if (resolvedType === 'gift-card' && !email) {
      return res.status(400).json({ success: false, message: 'Gift card claims require a valid email address.' });
    }

    const claim = await PrizeClaim.create({
      userId,
      giveawayId,
      prizeId: prizeId || winner.prizeId,
      winnerId: winner._id,
      type: resolvedType,
      name,
      phone,
      address,
      city,
      state,
      pin,
      email,
      status: 'pending'
    });

    await AuditLog.create({
      entityType: 'PrizeClaim',
      entityId: String(claim._id),
      action: 'CLAIM_SUBMITTED',
      performedBy: userId,
      userId,
      giveawayId: String(giveawayId),
      result: 'PENDING',
      requestId: req.headers['x-request-id'] || `claim-${Date.now()}`,
      metadata: { type: resolvedType, winnerId: String(winner._id) }
    });

    return res.status(201).json({
      success: true,
      message: 'Reward claim submitted successfully',
      data: {
        claimId: claim._id,
        status: claim.status,
        type: claim.type,
        giveawayId,
        userId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
