import mongoose from 'mongoose';
import Giveaway from '../models/Giveaway.js';
import GiveawayWinner from '../models/GiveawayWinner.js';
import AuditLog from '../models/AuditLog.js';
import GiveawayParticipation from '../models/GiveawayParticipation.js';

export const chooseWinner = async ({ giveawayId, prizeId, prizeWinnerCount = 1 }) => {
  if (!giveawayId) throw new Error('giveawayId is required');

  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) throw new Error('GIVEAWAY_NOT_FOUND');

  const existingCount = await GiveawayWinner.countDocuments({ giveawayId, status: 'selected' });
  const allowedWinners = Number(giveaway.prizeConfig?.winnerCount || 1);

  if (existingCount >= allowedWinners) {
    return { success: true, data: [], message: 'Winner limit already reached', winnerCount: allowedWinners };
  }

  const participants = await GiveawayParticipation.find({ giveawayId, status: 'joined' }).select('userId').lean();
  const winnerIds = participants
    .sort(() => Math.random() - 0.5)
    .map(({ userId }) => userId)
    .slice(0, Math.max(0, allowedWinners - existingCount));

  const created = [];

  for (const userId of winnerIds) {
    const existing = await GiveawayWinner.findOne({ giveawayId, userId }).lean();
    if (existing) continue;

    const winner = await GiveawayWinner.create({
      giveawayId,
      prizeId: prizeId || new mongoose.Types.ObjectId(),
      userId,
      selectionMethod: 'backend-controlled-random',
      status: 'selected',
      selectedAt: new Date()
    });

    created.push(winner);

    await AuditLog.create({
      entityType: 'GiveawayWinner',
      entityId: String(winner._id),
      action: 'WINNER_SELECTED',
      performedBy: 'SYSTEM',
      userId,
      giveawayId: String(giveawayId),
      result: 'SUCCESS',
      metadata: { selectionMethod: 'backend-controlled-random', prizeWinnerCount: allowedWinners }
    });
  }

  return { success: true, data: created, winnerCount: allowedWinners };
};
