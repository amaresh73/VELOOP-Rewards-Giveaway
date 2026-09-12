import express from 'express';
import { createClaim } from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';
import { getMyClaim } from '../controllers/giveawayController.js';

const router = express.Router();

router.post('/', rateLimiter({ max: 8, windowMs: 60_000, message: 'Too many claim submissions. Please wait and try again later.' }), protect, createClaim);
router.get('/giveaway/:id', protect, getMyClaim);

export default router;
