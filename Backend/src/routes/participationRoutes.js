import express from 'express';
import { joinGiveaway } from '../controllers/participationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/join', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many participation requests. Please wait before trying again.' }), protect, joinGiveaway);

export default router;
