const mongoose = require('mongoose');

/**
 * Task 78: Token Blacklist Schema for logout functionality
 * Stores revoked tokens to prevent reuse after logout
 */
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  guestId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['logout', 'security', 'expired', 'revoked'],
    default: 'logout'
  },
  blacklistedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
    // No index: true here - TTL index defined separately below
  }
}, {
  timestamps: true
});

// TTL index - automatically remove blacklisted tokens after they expire
// Note: This is the ONLY place we define the expiresAt index
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookups
tokenBlacklistSchema.index({ token: 1, userId: 1 });

/**
 * Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} True if token is blacklisted
 */
tokenBlacklistSchema.statics.isBlacklisted = async function(token) {
  const blacklisted = await this.findOne({ 
    token,
    expiresAt: { $gt: new Date() }
  });
  return !!blacklisted;
};

/**
 * Task 79: Cleanup expired tokens from blacklist
 * @returns {Promise<number>} Number of tokens removed
 */
tokenBlacklistSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

/**
 * Blacklist a token
 * @param {string} token - JWT token to blacklist
 * @param {string} userId - User ID
 * @param {string} guestId - Guest ID
 * @param {Date} expiresAt - Token expiration date
 * @param {string} reason - Reason for blacklisting
 * @returns {Promise<Object>} Blacklist document
 */
tokenBlacklistSchema.statics.blacklistToken = async function(token, userId, guestId, expiresAt, reason = 'logout') {
  try {
    const blacklisted = await this.create({
      token,
      userId,
      guestId,
      expiresAt,
      reason
    });
    return blacklisted;
  } catch (error) {
    // If duplicate key error (token already blacklisted), ignore
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};

/**
 * Get blacklist statistics
 * @returns {Promise<Object>} Statistics object
 */
tokenBlacklistSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({
    expiresAt: { $gt: new Date() }
  });
  const expired = total - active;
  
  return {
    total,
    active,
    expired,
    timestamp: new Date()
  };
};

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);