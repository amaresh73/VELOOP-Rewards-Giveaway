import GiveawayWinner from '../models/GiveawayWinner.js';
import Giveaway from '../models/Giveaway.js';
import { chooseWinner } from '../services/winnerService.js';

export const getWinners = async (req, res) => {
  try {
    const winners = await GiveawayWinner.find().select('-__v').sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, data: winners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const selectWinner = async (req, res) => {
  try {
    const { giveawayId, prizeId } = req.body;

    if (!giveawayId) {
      return res.status(400).json({ success: false, message: 'giveawayId is required' });
    }

    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) {
      return res.status(404).json({ success: false, message: 'Giveaway not found' });
    }

    if (!['ENDED', 'ARCHIVED', 'CLOSED'].includes(String(giveaway.status || '').toUpperCase())) {
      return res.status(400).json({ success: false, message: 'GIVEAWAY_NOT_ENDED' });
    }

    const result = await chooseWinner({ giveawayId, prizeId });

    return res.status(201).json({
      success: true,
      message: 'Winner selection finalized by backend',
      data: result.data,
      winnerCount: result.winnerCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
