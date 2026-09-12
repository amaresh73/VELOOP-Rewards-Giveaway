import express from 'express';
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  login,
  register,
  sendOtp,
  verifyOtp,
  verifyRegistrationOtp,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', rateLimiter({ max: 10, windowMs: 60_000, message: 'Too many registration attempts. Please wait a minute.' }), register);
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

export default router;
