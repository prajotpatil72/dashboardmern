const User = require('../models/User');
const GuestSession = require('../models/GuestSession');
const { generateGuestToken, generateGuestId } = require('../utils/guestToken');
const { quotaLimits } = require('../config/auth');

/**
 * @desc    Generate guest token
 * @route   POST /api/v1/auth/guest
 * @access  Public
 */
exports.createGuestSession = async (req, res) => {
  try {
    // Generate unique guest ID
    const guestId = generateGuestId();

    // Create guest user in database
    const guestUser = await User.create({
      guestId,
      userType: 'GUEST',
      displayName: `Guest_${guestId.slice(0, 8)}`,
      quotaUsed: 0,
      quotaLimit: quotaLimits.GUEST,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Generate JWT token
    const token = generateGuestToken(guestUser);

    // Create session record
    await GuestSession.create({
      guestId,
      token,
      isActive: true,
      expiresAt: guestUser.expiresAt,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        fingerprint: req.headers['x-fingerprint'] || ''
      }
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: guestUser._id,
          guestId: guestUser.guestId,
          displayName: guestUser.displayName,
          userType: guestUser.userType,
          quotaLimit: guestUser.quotaLimit,
          quotaUsed: guestUser.quotaUsed,
          quotaRemaining: guestUser.getQuotaRemaining(),
          createdAt: guestUser.createdAt,
          expiresAt: guestUser.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Create guest session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create guest session',
      message: error.message
    });
  }
};

/**
 * @desc    Refresh guest session (extend by 24h)
 * @route   POST /api/v1/auth/guest/refresh
 * @access  Guest (requires valid token)
 */
exports.refreshGuestSession = async (req, res) => {
  try {
    if (!req.user || !req.isGuest) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired guest session'
      });
    }

    const user = req.user;

    // Update expiration time
    user.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.quotaUsed = 0; // Reset quota on refresh
    await user.save();

    // Generate new token
    const newToken = generateGuestToken(user);

    // Update session record
    await GuestSession.findOneAndUpdate(
      { guestId: user.guestId, isActive: true },
      {
        token: newToken,
        expiresAt: user.expiresAt,
        lastActivity: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          guestId: user.guestId,
          displayName: user.displayName,
          userType: user.userType,
          quotaLimit: user.quotaLimit,
          quotaUsed: user.quotaUsed,
          quotaRemaining: user.getQuotaRemaining(),
          expiresAt: user.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Refresh guest session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh guest session'
    });
  }
};

/**
 * @desc    Logout guest (deactivate session)
 * @route   POST /api/v1/auth/logout
 * @access  Guest
 */
exports.logoutGuest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Deactivate session
    await GuestSession.findOneAndUpdate(
      { guestId: req.user.guestId, isActive: true },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
};