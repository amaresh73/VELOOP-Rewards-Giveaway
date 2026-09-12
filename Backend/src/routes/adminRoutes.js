import express from 'express';
import Giveaway from '../models/Giveaway.js';
import GiveawayParticipation from '../models/GiveawayParticipation.js';
import GiveawayWinner from '../models/GiveawayWinner.js';
import PrizeClaim from '../models/PrizeClaim.js';
import FraudEvent from '../models/FraudEvent.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats — live dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalGiveaways,
      liveGiveaways,
      totalParticipants,
      totalWinners,
      pendingClaims,
      approvedClaims,
      fraudEvents
    ] = await Promise.all([
      Giveaway.countDocuments(),
      Giveaway.countDocuments({ status: { $in: ['live', 'ACTIVE', 'active', 'ending-soon'] } }),
      GiveawayParticipation.countDocuments({ status: 'joined' }),
      GiveawayWinner.countDocuments(),
      PrizeClaim.countDocuments({ status: 'pending' }),
      PrizeClaim.countDocuments({ status: 'approved' }),
      FraudEvent.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    return res.json({
      success: true,
      data: {
        totalGiveaways,
        liveGiveaways,
        totalParticipants,
        totalWinners,
        pendingClaims,
        approvedClaims,
        fraudEvents
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/claims — all claims with pagination
router.get('/claims', async (req, res) => {
  try {
    const claims = await PrizeClaim.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: claims });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/claims/:id — approve or reject a claim
router.patch('/claims/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const claim = await PrizeClaim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
    return res.json({ success: true, data: claim });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/giveaways — all giveaways with participant counts
router.get('/giveaways', async (req, res) => {
  try {
    const giveaways = await Giveaway.find().sort({ createdAt: -1 }).lean();
    const counts = await GiveawayParticipation.aggregate([
      { $group: { _id: '$giveawayId', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    return res.json({
      success: true,
      data: giveaways.map((g) => ({ ...g, participantCount: countMap[String(g._id)] || 0 }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/giveaways/:id/status — update giveaway status
router.patch('/giveaways/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'live', 'upcoming', 'ending-soon', 'closed', 'ARCHIVED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }
    const giveaway = await Giveaway.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });
    return res.json({ success: true, data: giveaway });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/winners — all winners
router.get('/winners', async (req, res) => {
  try {
    const winners = await GiveawayWinner.find()
      .sort({ selectedAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: winners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
