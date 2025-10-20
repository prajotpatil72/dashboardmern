const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const User = require('../models/User');

/**
 * Optional authentication middleware
 * Verifies token if present, allows unauthenticated access otherwise
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - allow request to proceed
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Check if token has expired (additional check)
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Attach user to request
    req.user = user;
    req.isAuthenticated = true;
    req.isGuest = user.userType === 'GUEST';
    req.token = token;

    next();
  } catch (error) {
    // Token invalid or expired - allow request but mark as unauthenticated
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Other errors
    console.error('Optional auth middleware error:', error);
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

module.exports = optionalAuth;