const express = require('express');
const router = express.Router();
const {
  createGuestSession,
  refreshGuestSession,
  logoutGuest
} = require('../controllers/guestController');
const optionalAuth = require('../middleware/optionalAuth');

// Public route - create guest session
router.post('/guest', createGuestSession);

// Protected routes - require authentication
router.post('/guest/refresh', optionalAuth, refreshGuestSession);
router.post('/logout', optionalAuth, logoutGuest);

module.exports = router;