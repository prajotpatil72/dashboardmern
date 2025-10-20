const User = require('../models/User');

/**
 * Quota tracking middleware
 * Tracks and enforces API usage quotas for guests
 */
const quotaTracker = async (req, res, next) => {
  try {
    // Skip if no user authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please obtain a guest token.'
      });
    }

    const user = req.user;

    // Check if user has quota remaining
    if (user.quotaUsed >= user.quotaLimit) {
      return res.status(429).json({
        success: false,
        error: 'Daily quota exceeded',
        data: {
          quotaUsed: user.quotaUsed,
          quotaLimit: user.quotaLimit,
          resetsAt: user.expiresAt,
          message: 'You have reached your daily search limit. Your quota will reset in 24 hours from session creation.'
        }
      });
    }

    // Track this request (only for search endpoints)
    const isSearchRequest = req.path.includes('/search') || 
                           req.path.includes('/video') || 
                           req.path.includes('/channel');

    if (isSearchRequest && req.method === 'GET') {
      // Increment quota
      await User.findByIdAndUpdate(user._id, {
        $inc: { quotaUsed: 1 },
        $push: {
          searchHistory: {
            query: req.query.q || req.params.videoId || req.params.channelId,
            timestamp: new Date(),
            endpoint: req.path
          }
        }
      });

      // Update user object for this request
      user.quotaUsed += 1;
    }

    // Attach quota info to response headers
    res.setHeader('X-Quota-Used', user.quotaUsed);
    res.setHeader('X-Quota-Limit', user.quotaLimit);
    res.setHeader('X-Quota-Remaining', user.quotaLimit - user.quotaUsed);
    res.setHeader('X-Quota-Resets-At', user.expiresAt);

    next();
  } catch (error) {
    console.error('Quota tracker error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track quota usage'
    });
  }
};

module.exports = quotaTracker;