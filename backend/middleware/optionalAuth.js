const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const token = authHeader.split(' ')[1];

    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // **NEW: Reset quota if session expired, then extend expiration**
    const now = new Date();
    if (user.expiresAt && now >= new Date(user.expiresAt)) {
      const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Reset quota and extend session
      await User.findByIdAndUpdate(user._id, {
        $set: { 
          quotaUsed: 0,
          expiresAt: newExpiresAt
        }
      });
      
      // Refresh user object with updated data
      const updatedUser = await User.findById(user._id);
      req.user = updatedUser;
      req.isAuthenticated = true;
      req.isGuest = updatedUser.userType === 'GUEST';
      req.token = token;
      
      console.log(`[Auth] Reset quota for user ${user._id} - new expiresAt: ${newExpiresAt}`);
      return next();
    }

    // Normal flow - session hasn't expired yet
    req.user = user;
    req.isAuthenticated = true;
    req.isGuest = user.userType === 'GUEST';
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    console.error('Optional auth middleware error:', error);
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

module.exports = optionalAuth;