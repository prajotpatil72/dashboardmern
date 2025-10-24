const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createGuestSession,
  refreshGuestSession,
  logoutGuest,
  getGuestAnalytics,
  verifyToken
} = require('../controllers/guestController');
const optionalAuth = require('../middleware/optionalAuth');

// Stricter rate limiter for guest creation
const guestAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 1000, // Add this line
  message: {
    success: false,
    error: 'Too many guest session creation attempts. Please try again later.'
  }
});

// Public routes
router.post('/guest', guestAuthRateLimiter, createGuestSession); // Rate limit applied here

// Protected routes - require authentication
router.post('/guest/refresh', optionalAuth, refreshGuestSession);
router.post('/logout', optionalAuth, logoutGuest);
router.get('/verify', optionalAuth, verifyToken);

// Analytics endpoint
router.get('/guest/analytics', getGuestAnalytics);

module.exports = router;