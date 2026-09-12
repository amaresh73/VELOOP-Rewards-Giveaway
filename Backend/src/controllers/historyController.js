import Giveaway from '../models/Giveaway.js';
import GiveawayWinner from '../models/GiveawayWinner.js';

export const getPreviousWinners = async (req, res) => {
  try {
    const completedGiveaways = await Giveaway.find({ status: { $in: ['ENDED', 'ARCHIVED', 'CLOSED', 'closed'] } })
      .sort({ endsAt: -1, createdAt: -1 })
      .lean();
    const winners = await GiveawayWinner.find({ giveawayId: { $in: completedGiveaways.map((item) => item._id) } })
      .sort({ selectedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: completedGiveaways.map((giveaway) => ({
        giveaway,
        winners: winners.filter((winner) => String(winner.giveawayId) === String(giveaway._id))
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load giveaway history.' });
  }
};