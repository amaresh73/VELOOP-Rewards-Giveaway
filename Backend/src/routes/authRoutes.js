import express from 'express';
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  login,
  register,
  verifyEmailToken,
  resendVerificationEmail,
  sendOtp,
  verifyOtp,
  verifyRegistrationOtp,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword,
  redeemPromoCode,
  requestWithdrawal,
  deliverWinningReward,
  getMyWinningRewards,
  addMoneyUpi,
  googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many registration attempts. Please wait a minute.' }), register);
router.post('/verify-email', rateLimiter({ max: 20, windowMs: 60_000, message: 'Too many verification attempts. Please wait.' }), verifyEmailToken);
router.get('/verify-email', rateLimiter({ max: 20, windowMs: 60_000, message: 'Too many verification attempts. Please wait.' }), verifyEmailToken);
router.post('/resend-verification', rateLimiter({ max: 6, windowMs: 60_000, message: 'Too many resend attempts. Please wait a minute.' }), resendVerificationEmail);
router.post('/google', rateLimiter({ max: 20, windowMs: 60_000, message: 'Too many Google sign-in attempts. Please wait.' }), googleAuth);
router.post('/send-otp', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many OTP requests. Please wait a minute.' }), sendOtp);
router.post('/verify-otp', rateLimiter({ max: 15, windowMs: 60_000, message: 'Too many OTP verification attempts. Please wait.' }), verifyOtp);
router.post('/verify-registration-otp', rateLimiter({ max: 15, windowMs: 60_000, message: 'Too many OTP verification attempts. Please wait.' }), verifyRegistrationOtp);

router.post('/send-email-otp', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many OTP requests. Please wait a minute.' }), sendEmailOtp);
router.post('/verify-email-otp', rateLimiter({ max: 15, windowMs: 60_000, message: 'Too many OTP verification attempts. Please wait.' }), verifyEmailOtp);
router.post('/reset-password', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many password reset requests. Please wait a minute.' }), resetPassword);
router.post('/login', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many login attempts. Please try again in a minute.' }), login);
router.get('/login', (req, res) => {
	res.status(405).json({
		success: false,
		message: 'Use POST /api/auth/login with email and password, or POST /api/auth/register.'
	});
});
router.get('/me', protect, getCurrentUser);
router.put('/change-password', protect, rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many attempts. Please try again later.' }), changePassword);
router.delete('/delete-account', protect, rateLimiter({ max: 5, windowMs: 60_000, message: 'Too many attempts. Please try again later.' }), deleteAccount);
router.post('/redeem-code', protect, rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many redemption attempts. Please wait.' }), redeemPromoCode);
router.post('/withdraw', protect, rateLimiter({ max: 5, windowMs: 60_000, message: 'Too many withdrawal attempts. Please wait.' }), requestWithdrawal);
router.get('/my-winning-rewards', protect, getMyWinningRewards);
router.post('/deliver-reward', protect, rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many delivery requests. Please wait.' }), deliverWinningReward);
router.post('/add-money-upi', protect, rateLimiter({ max: 20, windowMs: 60_000, message: 'Too many top-up requests. Please wait.' }), addMoneyUpi);

export default router;
