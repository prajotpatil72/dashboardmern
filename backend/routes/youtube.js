/**
 * YouTube Routes - Fixed
 */
const express = require('express');
const router = express.Router();
const { youtubeService } = require('../services/youtubeService');
const optionalAuth = require('../middleware/optionalAuth');
const quotaTracker = require('../middleware/quotaTracker');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Apply middleware
router.use(optionalAuth);
router.use(quotaTracker);

/**
 * Search for videos
 * GET /api/v1/youtube/search?q=query&maxResults=20&order=relevance
 */
router.get('/search', cacheMiddleware('search'), async (req, res) => {
  try {
    const { q, maxResults = 20, order = 'relevance' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // searchVideos already returns parsed video objects
    const results = await youtubeService.searchVideos(q, {
      maxResults: parseInt(maxResults),
      order
    });

    res.json({
      success: true,
      data: {
        results,
        query: q,
        count: results.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[YouTube Routes] Search error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to search videos'
    });
  }
});

/**
 * Get video details by ID
 * GET /api/v1/youtube/video/:videoId
 */
router.get('/video/:videoId', cacheMiddleware('video'), async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || videoId.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'Valid video ID is required (11 characters)'
      });
    }

    // getVideoDetails already returns a parsed video object
    const video = await youtubeService.getVideoDetails(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: { video },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[YouTube Routes] Video details error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message || 'Failed to get video details'
    });
  }
});

/**
 * Get channel stats
 * GET /api/v1/youtube/channel/:channelId
 */
router.get('/channel/:channelId', cacheMiddleware('channel'), async (req, res) => {
  try {
    const { channelId } = req.params;

    // Validate channel ID
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID is required'
      });
    }

    // Channel IDs typically start with UC and are 24 characters
    if (channelId.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Channel ID must be at least 5 characters'
      });
    }

    // Clean channel ID (remove spaces, special characters)
    const cleanChannelId = channelId.trim();

    // getChannelStats already returns a parsed channel object
    const channel = await youtubeService.getChannelStats(cleanChannelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }

    res.json({
      success: true,
      data: { channel },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[YouTube Routes] Channel stats error:', error);
    
    // Better error messages
    let errorMessage = 'Failed to get channel stats';
    let statusCode = 500;

    if (error.response?.status === 404) {
      errorMessage = 'Channel not found. Please check the channel ID.';
      statusCode = 404;
    } else if (error.response?.status === 403) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 403;
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid channel ID format.';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

module.exports = router;
