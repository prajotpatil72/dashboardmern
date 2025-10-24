const cron = require('node-cron');
const User = require('../models/User');
const GuestSession = require('../models/GuestSession');
const TokenBlacklist = require('../models/TokenBlacklist');

/**
 * Cleanup expired guest sessions and tokens
 */
const cleanupExpiredSessions = async () => {
  try {
    console.log('[Cleanup Job] Starting expired session cleanup...');

    const now = new Date();

    // Delete expired users
    const deletedUsers = await User.deleteMany({
      expiresAt: { $lt: now }
    });

    // Delete expired sessions
    const deletedSessions = await GuestSession.deleteMany({
      expiresAt: { $lt: now }
    });

    // Task 79: Cleanup expired tokens from blacklist
    const deletedTokens = await TokenBlacklist.cleanupExpiredTokens();

    console.log(`[Cleanup Job] Removed ${deletedUsers.deletedCount} expired users`);
    console.log(`[Cleanup Job] Removed ${deletedSessions.deletedCount} expired sessions`);
    console.log(`[Cleanup Job] Removed ${deletedTokens} expired tokens from blacklist`);
    
    return {
      usersDeleted: deletedUsers.deletedCount,
      sessionsDeleted: deletedSessions.deletedCount,
      tokensDeleted: deletedTokens,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[Cleanup Job] Error during cleanup:', error);
    throw error;
  }
};

/**
 * Task 77: Start the cron job for token cleanup
 * Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
 */
const startCleanupJob = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    await cleanupExpiredSessions();
  });

  console.log('[Cleanup Job] Scheduled to run every hour');
  console.log('[Cleanup Job] Includes: Users, Sessions, and Token Blacklist');
};

/**
 * Manual trigger for testing
 */
const runCleanupNow = async () => {
  return await cleanupExpiredSessions();
};

module.exports = {
  startCleanupJob,
  runCleanupNow,
  cleanupExpiredSessions
};