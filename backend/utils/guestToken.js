const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

/**
 * Generate a guest token with UUID-based identification
 */
const generateGuestToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    guestId: user.guestId,
    userType: user.userType,
    quotaLimit: user.quotaLimit,
    quotaUsed: user.quotaUsed || 0,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, jwtSecret);
};

/**
 * Generate a unique guest ID
 */
const generateGuestId = () => {
  return uuidv4();
};

/**
 * Verify and decode a guest token
 */
const verifyGuestToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  return decoded.exp < Math.floor(Date.now() / 1000);
};

module.exports = {
  generateGuestToken,
  generateGuestId,
  verifyGuestToken,
  decodeToken,
  isTokenExpired
};