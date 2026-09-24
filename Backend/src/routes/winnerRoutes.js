import express from 'express';
import { getWinners, selectWinner } from '../controllers/winnerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';

const router = express.Router();

router.get('/', protect, getWinners);
router.post('/select', protect, authorize('admin'), selectWinner);

export default router;
