import express from 'express';
import Giveaway from '../models/Giveaway.js';
import { getGiveaways, getCurrentGiveaway, getGiveawayById, getGiveawayBySlug, getMyParticipationStatus, getGiveawayWinners, getMyClaim } from '../controllers/giveawayController.js';
import { joinGiveaway } from '../controllers/participationController.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';
import { createGiveaway } from '../controllers/adminGiveawayController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { createClaim } from '../controllers/claimController.js';
import { getPreviousWinners } from '../controllers/historyController.js';

const router = express.Router();

router.get('/current', protect, getCurrentGiveaway);
router.get('/previous', protect, getPreviousWinners);
router.get('/previous/winners', protect, getPreviousWinners);
router.get('/slug/:slug', protect, getGiveawayBySlug);
router.get('/:id/my-status', protect, getMyParticipationStatus);
router.get('/:id/winners', protect, getGiveawayWinners);
router.post('/:id/join', rateLimiter({ max: 10, windowMs: 60_000 }), protect, (req, res, next) => {
  req.body.giveawayId = req.params.id;
  return joinGiveaway(req, res, next);
});
router.post('/:id/claim', rateLimiter({ max: 8, windowMs: 60_000 }), protect, (req, res, next) => {
  req.body.giveawayId = req.params.id;
  return createClaim(req, res, next);
});
router.get('/:id/my-claim', protect, getMyClaim);
router.get('/:id', protect, getGiveawayById);
router.get('/', protect, getGiveaways);
router.post('/', protect, authorize('admin'), createGiveaway);

router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await Giveaway.countDocuments();

    if (count > 0) {
      return res.json({ success: true, message: 'Seed data already present', count });
    }

    const seedData = [
      {
        title: 'Summer Elite Drop',
        slug: 'summer-elite-drop',
        status: 'live',
        type: 'Instant Win',
        prize: '$500 Amazon Gift Card',
        description: 'Unlock exclusive summer prizes with Veloop points and instant reward draws.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        participants: 1248,
        entries: 21980,
        endsIn: '06:12:44:18',
        rules: ['Must be a verified member', 'One entry per day', 'Prize can be claimed within 7 days']
      },
      {
        title: 'Crypto Freedom Bundle',
        slug: 'crypto-freedom-bundle',
        status: 'upcoming',
        type: 'Reward Bundle',
        prize: '1 BTC + 3 Premium Rewards',
        description: 'A premium giveaway designed for high-earning loyalty members and community champions.',
        image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=900&q=80',
        participants: 3210,
        entries: 48250,
        endsIn: '12:20:11:09',
        rules: ['Players must complete profile verification', 'Referral bonus adds 2x entries', 'Eligible for active community members']
      },
      {
        title: 'Weekend Tech Chest',
        slug: 'weekend-tech-chest',
        status: 'ending-soon',
        type: 'Lucky Draw',
        prize: 'MacBook Pro + AirPods',
        description: 'A weekend burst of premium tech rewards for community members who stay active.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
        participants: 918,
        entries: 16340,
        endsIn: '02:03:09:11',
        rules: ['Open to verified accounts only', 'Daily login boost increases odds', 'Winners selected randomly at close']
      }
    ];

    const result = await Giveaway.insertMany(seedData.map((item, index) => ({
      ...item,
      giveawayCode: `GW-${String(index + 1).padStart(3, '0')}`
    })));
    return res.status(201).json({ success: true, message: 'Seed data inserted', count: result.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
