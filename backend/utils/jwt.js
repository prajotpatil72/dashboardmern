const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

/**
 * @typedef {Object} TokenPayload
 * @property {string} userId - MongoDB user ID
 * @property {string} userType - User type (GUEST)
 * @property {string} guestId - Guest unique identifier
 * @property {number} quotaLimit - Maximum API calls allowed
 * @property {number} quotaUsed - Current API calls used
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 */

/**
 * Task 72-74: Generate JWT token for a user
 * Creates a token with 24-hour expiration for guest users
 * 
 * @param {Object} user - User document from MongoDB
 * @param {string} user._id - User's MongoDB ObjectId
 * @param {string} user.guestId - Guest's UUID
 * @param {string} user.userType - User type (GUEST)
 * @param {number} user.quotaLimit - User's quota limit
 * @param {number} user.quotaUsed - User's current quota usage
 * @returns {string} JWT token
 * @throws {Error} If user data is invalid
 * 
 * @example
 * const token = generateToken(userDocument);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
const generateToken = (user) => {
  if (!user || !user._id || !user.guestId) {
    throw new Error('Invalid user data: missing required fields');
  }

  // Task 73: Token payload structure
  const payload = {
    userId: user._id.toString(),
    userType: user.userType || 'GUEST',
    guestId: user.guestId,
    quotaLimit: user.quotaLimit || 100,
    quotaUsed: user.quotaUsed || 0,
    iat: Math.floor(Date.now() / 1000),
    // Task 74: Set expiration to 24 hours
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };

  try {
    const token = jwt.sign(payload, jwtSecret);
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Task 75: Verify JWT token with comprehensive error handling
 * Validates token signature and expiration
 * 
 * @param {string} token - JWT token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid, expired, or malformed
 * 
 * @example
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.userId);
 * } catch (error) {
 *   console.error('Token verification failed:', error.message);
 * }
 */
const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    // Specific error handling for different JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token signature');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not yet valid');
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Task 76: Decode token without verification (for debugging)
 * Extracts payload without validating signature or expiration
 * USE WITH CAUTION: Only for debugging or logging purposes
 * 
 * @param {string} token - JWT token to decode
 * @returns {TokenPayload|null} Decoded payload or null if invalid
 * 
 * @example
 * const payload = decodeToken(token);
 * if (payload) {
 *   console.log('Token expires at:', new Date(payload.exp * 1000));
 * }
 */
const decodeToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error('Token decode error:', error.message);
    return null;
  }
};

/**
 * Check if a token is expired without verification
 * Useful for client-side token validation
 * 
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 * 
 * @example
 * if (isTokenExpired(token)) {
 *   console.log('Token needs refresh');
 * }
 */
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get remaining time until token expiration
 * 
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration (0 if expired)
 * 
 * @example
 * const secondsLeft = getTokenExpiryTime(token);
 * console.log(`Token expires in ${secondsLeft} seconds`);
 */
const getTokenExpiryTime = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - currentTime;
  return timeLeft > 0 ? timeLeft : 0;
};

/**
 * Refresh token by generating a new one with the same user data
 * Updates the issued at (iat) and expiration (exp) timestamps
 * 
 * @param {string} oldToken - Existing JWT token
 * @param {Object} user - User document from MongoDB
 * @returns {string} New JWT token
 * @throws {Error} If token is invalid or user data is missing
 * 
 * @example
 * const newToken = refreshToken(oldToken, userDocument);
 */
const refreshToken = (oldToken, user) => {
  // Verify the old token is valid
  verifyToken(oldToken);
  
  // Generate new token with updated timestamps
  return generateToken(user);
};

// Task 80: Export utilities with comprehensive JSDoc documentation
module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiryTime,
  refreshToken
};