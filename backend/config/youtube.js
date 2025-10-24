const { google } = require('googleapis');

/**
 * YouTube API Configuration
 * Initializes the YouTube Data API v3 client
 */

// Validate API key exists
if (!process.env.YOUTUBE_API_KEY) {
  console.error('FATAL ERROR: YOUTUBE_API_KEY is not defined in environment variables');
  process.exit(1);
}

// Initialize YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * YouTube API Configuration Constants
 */
const youtubeConfig = {
  // API client
  client: youtube,

  // API Quota limits (per day)
  quotaLimits: {
    search: 100,           // Cost: 100 units per request
    videoDetails: 1,       // Cost: 1 unit per request
    channelDetails: 1,     // Cost: 1 unit per request
    commentThreads: 1,     // Cost: 1 unit per request
    dailyLimit: 10000      // Default daily quota: 10,000 units
  },

  // Default parameters for API requests
  defaults: {
    maxResults: 10,        // Default number of results per page
    maxResultsLimit: 50,   // Maximum allowed by YouTube API
    regionCode: 'US',      // Default region
    relevanceLanguage: 'en', // Default language
    safeSearch: 'moderate', // 'none', 'moderate', 'strict'
    videoEmbeddable: true,
    videoSyndicated: true,
    videoType: 'any'       // 'any', 'episode', 'movie'
  },

  // Video parts to request (affects quota usage)
  videoParts: [
    'snippet',             // Title, description, thumbnails, etc.
    'contentDetails',      // Duration, definition, dimension, etc.
    'statistics',          // Views, likes, comments, etc.
    'status'              // Upload status, privacy status, etc.
  ],

  // Channel parts to request
  channelParts: [
    'snippet',             // Title, description, thumbnails, etc.
    'contentDetails',      // Uploads playlist ID, etc.
    'statistics',          // Subscriber count, view count, etc.
    'brandingSettings'    // Channel keywords, etc.
  ],

  // Search order options
  searchOrders: {
    RELEVANCE: 'relevance',
    DATE: 'date',
    RATING: 'rating',
    TITLE: 'title',
    VIDEO_COUNT: 'videoCount',
    VIEW_COUNT: 'viewCount'
  },

  // Video durations
  videoDurations: {
    ANY: 'any',
    SHORT: 'short',       // < 4 minutes
    MEDIUM: 'medium',     // 4-20 minutes
    LONG: 'long'          // > 20 minutes
  },

  // Video definitions
  videoDefinitions: {
    ANY: 'any',
    STANDARD: 'standard', // SD
    HIGH: 'high'          // HD
  },

  // Error messages
  errors: {
    QUOTA_EXCEEDED: 'YouTube API quota exceeded. Please try again tomorrow.',
    INVALID_API_KEY: 'Invalid YouTube API key. Please check your configuration.',
    VIDEO_NOT_FOUND: 'Video not found or unavailable.',
    CHANNEL_NOT_FOUND: 'Channel not found.',
    RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
    NETWORK_ERROR: 'Network error while connecting to YouTube API.',
    UNKNOWN: 'An unknown error occurred while fetching YouTube data.'
  },

  // Cache settings (for future implementation)
  cache: {
    enabled: process.env.NODE_ENV === 'production',
    ttl: {
      search: 3600,        // 1 hour
      videoDetails: 86400, // 24 hours
      channelDetails: 86400 // 24 hours
    }
  }
};

/**
 * Helper function to build video parts string
 */
youtubeConfig.getVideoParts = () => {
  return youtubeConfig.videoParts.join(',');
};

/**
 * Helper function to build channel parts string
 */
youtubeConfig.getChannelParts = () => {
  return youtubeConfig.channelParts.join(',');
};

/**
 * Helper function to validate max results
 */
youtubeConfig.validateMaxResults = (maxResults) => {
  const num = parseInt(maxResults, 10);
  if (isNaN(num) || num < 1) {
    return youtubeConfig.defaults.maxResults;
  }
  return Math.min(num, youtubeConfig.defaults.maxResultsLimit);
};

/**
 * Helper function to get API client
 */
youtubeConfig.getClient = () => {
  return youtube;
};

/**
 * Helper function to check if API key is valid
 */
youtubeConfig.isConfigured = () => {
  return !!process.env.YOUTUBE_API_KEY;
};

module.exports = youtubeConfig;