const User = require('../models/User');

const quotaTracker = async (req, res, next) => {
  try {
    // Skip quota tracking in development
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('X-Quota-Used', 'N/A (dev mode)');
      res.setHeader('X-Quota-Limit', 'unlimited (dev mode)');
      res.setHeader('X-Quota-Remaining', 'unlimited (dev mode)');
      return next();
    }

    // If no user authenticated, allow but don't track quota
    if (!req.user || !req.isAuthenticated) {
      res.setHeader('X-Quota-Used', 'N/A');
      res.setHeader('X-Quota-Limit', 'N/A');
      res.setHeader('X-Quota-Remaining', 'N/A');
      return next();
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
                           req.path.includes('/channel') ||
                           req.path.includes('/trending');
    
    if (isSearchRequest && req.method === 'GET') {
      // Increment quota
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { quotaUsed: 1 },
          $push: {
            searchHistory: {
              query: req.query.q || req.params.videoId || req.params.channelId || 'trending',
              timestamp: new Date(),
              endpoint: req.path,
              resultCount: 0
            }
          }
        },
        { new: true } // Return updated document
      );

      // Set response headers with updated values
      res.setHeader('X-Quota-Used', updatedUser.quotaUsed);
      res.setHeader('X-Quota-Limit', updatedUser.quotaLimit);
      res.setHeader('X-Quota-Remaining', updatedUser.quotaLimit - updatedUser.quotaUsed);
      
      // Update req.user for downstream middleware
      req.user = updatedUser;
    } else {
      // Set headers for non-search requests
      res.setHeader('X-Quota-Used', user.quotaUsed);
      res.setHeader('X-Quota-Limit', user.quotaLimit);
      res.setHeader('X-Quota-Remaining', user.quotaLimit - user.quotaUsed);
    }

    next();
  } catch (error) {
    console.error('[Quota Tracker] Error:', error);
    next();
  }
};

module.exports = quotaTracker;