const User = require('../models/User');
const GuestSession = require('../models/GuestSession');
const TokenBlacklist = require('../models/TokenBlacklist');
const { generateGuestToken, generateGuestId } = require('../utils/guestToken');
const { quotaLimits } = require('../config/auth');
const { generateFingerprint, checkFingerprintAbuse } = require('../middleware/fingerprint');
const { decodeToken } = require('../utils/jwt');

// ... existing functions ...

/**
 * @desc    Logout guest (deactivate session and blacklist token)
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

    const token = req.token;
    const decoded = decodeToken(token);

    // Deactivate session
    await GuestSession.findOneAndUpdate(
      { guestId: req.user.guestId, isActive: true },
      { isActive: false }
    );

    // Task 78: Blacklist the token
    if (decoded && decoded.exp) {
      await TokenBlacklist.blacklistToken(
        token,
        req.user._id,
        req.user.guestId,
        new Date(decoded.exp * 1000),
        'logout'
      );
    }

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

// ... rest of the file ...
exports.createGuestSession = async (req, res) => {
  try {
    // Generate fingerprint
    const fingerprintData = generateFingerprint(req);
    
    // Check for abuse (Task 57)
    const isAbusive = await checkFingerprintAbuse(fingerprintData.fingerprint, GuestSession);
    
    if (isAbusive) {
      return res.status(429).json({
        success: false,
        error: 'Too many active sessions detected. Please wait for existing sessions to expire.'
      });
    }

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

    // Create session record with fingerprinting (Task 57, 58)
    await GuestSession.create({
      guestId,
      token,
      isActive: true,
      expiresAt: guestUser.expiresAt,
      metadata: {
        ipAddress: fingerprintData.ip,
        userAgent: fingerprintData.userAgent,
        fingerprint: fingerprintData.fingerprint
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

/**
 * @desc    Get guest session analytics (admin/debugging)
 * @route   GET /api/v1/auth/guest/analytics
 * @access  Public (for development)
 */
exports.getGuestAnalytics = async (req, res) => {
  try {
    const totalSessions = await GuestSession.countDocuments();
    const activeSessions = await GuestSession.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ userType: 'GUEST' });
    
    // Sessions created in last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessions = await GuestSession.countDocuments({
      createdAt: { $gte: last24h }
    });

    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        totalUsers,
        sessionsLast24h: recentSessions,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

/**
 * @desc    Verify token and return user info
 * @route   GET /api/v1/auth/verify
 * @access  Guest (requires valid token)
 */
exports.verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = req.user;

    // Check if session is still active
    const session = await GuestSession.findOne({
      guestId: user.guestId,
      isActive: true
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Session not active'
      });
    }

    // Check if token is expired
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Session expired'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        guestId: user.guestId,
        displayName: user.displayName,
        userType: user.userType,
        quotaLimit: user.quotaLimit,
        quotaUsed: user.quotaUsed,
        expiresAt: user.expiresAt
      },
      quotaRemaining: user.getQuotaRemaining()
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};