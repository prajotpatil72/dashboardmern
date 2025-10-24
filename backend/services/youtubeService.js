/**
 * YouTube Service (Tasks 161-170)
 * Abstraction layer over googleapis for YouTube Data API v3
 * Handles all YouTube API interactions with quota tracking and error handling
 */

const youtubeConfig = require('../config/youtube');
const { parseVideoData, parseChannelData, parseSearchResults } = require('../utils/parseYouTubeData');

/**
 * Task 168: Quota tracking object
 * Logs every API call with its quota cost
 */
const quotaTracker = {
  calls: [],
  totalCost: 0,
  
  /**
   * Log an API call with its quota cost
   */
  logCall(endpoint, cost, success = true) {
    const call = {
      endpoint,
      cost,
      success,
      timestamp: new Date().toISOString(),
    };
    
    this.calls.push(call);
    if (success) {
      this.totalCost += cost;
    }
    
    console.log(`[Quota] ${endpoint} - Cost: ${cost} units - Total: ${this.totalCost}/${youtubeConfig.quotaLimits.dailyLimit}`);
  },
  
  /**
   * Get quota usage summary
   */
  getSummary() {
    return {
      totalCalls: this.calls.length,
      totalCost: this.totalCost,
      remaining: youtubeConfig.quotaLimits.dailyLimit - this.totalCost,
      percentUsed: ((this.totalCost / youtubeConfig.quotaLimits.dailyLimit) * 100).toFixed(2),
      calls: this.calls,
    };
  },
  
  /**
   * Reset quota tracker (called daily or manually)
   */
  reset() {
    this.calls = [];
    this.totalCost = 0;
    console.log('[Quota] Tracker reset');
  }
};

/**
 * Task 169: Exponential backoff for rate limiting
 * Retries failed requests with increasing delays
 */
const exponentialBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Check if error is quota exceeded or rate limit
      const isQuotaError = error.code === 403 || 
                          error.message?.includes('quota') ||
                          error.message?.includes('quotaExceeded');
      
      const isRateLimitError = error.code === 429 ||
                              error.message?.includes('rate limit') ||
                              error.message?.includes('rateLimitExceeded');
      
      // Don't retry quota errors
      if (isQuotaError) {
        console.error('[YouTube API] Quota exceeded - no retry');
        throw new Error(youtubeConfig.errors.QUOTA_EXCEEDED);
      }
      
      // Retry rate limit errors with backoff
      if (isRateLimitError && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[YouTube API] Rate limit hit - retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Last attempt or non-retryable error
      if (isLastAttempt) {
        throw error;
      }
      
      // Retry other errors with backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[YouTube API] Error - retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Task 162: Initialize YouTube API client
 * Task 163: Store API key from .env
 */
const youtube = youtubeConfig.getClient();

/**
 * YouTube Service Class
 */
class YouTubeService {
  /**
   * Task 164: Search videos by query
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of video objects with full details
   */
  async searchVideos(query, options = {}) {
    const {
      maxResults = 10,
      order = 'relevance',
      videoDuration,
      videoDefinition,
      type = 'video'
    } = options;

    try {
      // Validate maxResults
      const validMaxResults = youtubeConfig.validateMaxResults(maxResults);

      // Task 168: Log quota cost (search = 100 units)
      console.log(`[YouTube API] Searching videos: "${query}"`);

      // Task 169: Wrap in exponential backoff
      const searchResponse = await exponentialBackoff(async () => {
        return await youtube.search.list({
          part: 'snippet',
          q: query,
          type,
          maxResults: validMaxResults,
          order,
          videoDuration,
          videoDefinition,
          regionCode: youtubeConfig.defaults.regionCode,
          relevanceLanguage: youtubeConfig.defaults.relevanceLanguage,
          safeSearch: youtubeConfig.defaults.safeSearch,
        });
      });

      // Log successful API call
      quotaTracker.logCall('search.list', youtubeConfig.quotaLimits.search, true);

      // Parse search results to get video IDs
      const searchResults = parseSearchResults(searchResponse);
      const videoIds = searchResults
        .filter(item => item.videoId)
        .map(item => item.videoId);

      if (videoIds.length === 0) {
        return [];
      }

      // Get full video details for all videos
      const videosWithDetails = await this.getMultipleVideoDetails(videoIds);

      return videosWithDetails;

    } catch (error) {
      quotaTracker.logCall('search.list', youtubeConfig.quotaLimits.search, false);
      console.error('[YouTube API] Search error:', error.message);
      
      if (error.message === youtubeConfig.errors.QUOTA_EXCEEDED) {
        throw error;
      }
      
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }

  /**
   * Task 165: Get video details by ID
   * Returns single video with ALL parts (snippet, contentDetails, statistics, status)
   * 
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Parsed video object
   */
  async getVideoDetails(videoId) {
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    try {
      console.log(`[YouTube API] Fetching video details: ${videoId}`);

      // Task 169: Wrap in exponential backoff
      const response = await exponentialBackoff(async () => {
        return await youtube.videos.list({
          part: youtubeConfig.getVideoParts(), // snippet,contentDetails,statistics,status
          id: videoId,
        });
      });

      // Task 168: Log quota cost (videos.list = 1 unit per part, we use 4 parts = 4 units)
      quotaTracker.logCall('videos.list', youtubeConfig.videoParts.length, true);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(youtubeConfig.errors.VIDEO_NOT_FOUND);
      }

      // Task 170: Parse video data
      const videoData = parseVideoData(response.data.items[0]);

      return videoData;

    } catch (error) {
      quotaTracker.logCall('videos.list', youtubeConfig.videoParts.length, false);
      console.error('[YouTube API] Video details error:', error.message);
      
      if (error.message === youtubeConfig.errors.QUOTA_EXCEEDED) {
        throw error;
      }
      
      throw new Error(`Failed to get video details: ${error.message}`);
    }
  }

  /**
   * Get details for multiple videos at once
   * More efficient than calling getVideoDetails multiple times
   * 
   * @param {Array<string>} videoIds - Array of video IDs (max 50)
   * @returns {Promise<Array>} Array of parsed video objects
   */
  async getMultipleVideoDetails(videoIds) {
    if (!videoIds || videoIds.length === 0) {
      return [];
    }

    // YouTube API allows max 50 IDs per request
    const chunkedIds = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      chunkedIds.push(videoIds.slice(i, i + 50));
    }

    try {
      const allVideos = [];

      for (const chunk of chunkedIds) {
        const response = await exponentialBackoff(async () => {
          return await youtube.videos.list({
            part: youtubeConfig.getVideoParts(),
            id: chunk.join(','),
          });
        });

        quotaTracker.logCall('videos.list', youtubeConfig.videoParts.length, true);

        if (response.data.items) {
          const parsedVideos = response.data.items.map(item => parseVideoData(item));
          allVideos.push(...parsedVideos);
        }
      }

      return allVideos;

    } catch (error) {
      quotaTracker.logCall('videos.list', youtubeConfig.videoParts.length, false);
      console.error('[YouTube API] Multiple videos error:', error.message);
      throw new Error(`Failed to get video details: ${error.message}`);
    }
  }

  /**
   * Task 166: Get channel statistics and information
   * 
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<Object>} Parsed channel object
   */
  async getChannelStats(channelId) {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    try {
      console.log(`[YouTube API] Fetching channel stats: ${channelId}`);

      // Task 169: Wrap in exponential backoff
      const response = await exponentialBackoff(async () => {
        return await youtube.channels.list({
          part: youtubeConfig.getChannelParts(), // snippet,contentDetails,statistics,brandingSettings
          id: channelId,
        });
      });

      // Task 168: Log quota cost (channels.list = 1 unit per part, we use 4 parts = 4 units)
      quotaTracker.logCall('channels.list', youtubeConfig.channelParts.length, true);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(youtubeConfig.errors.CHANNEL_NOT_FOUND);
      }

      // Parse channel data
      const channelData = parseChannelData(response.data.items[0]);

      return channelData;

    } catch (error) {
      quotaTracker.logCall('channels.list', youtubeConfig.channelParts.length, false);
      console.error('[YouTube API] Channel stats error:', error.message);
      
      if (error.message === youtubeConfig.errors.QUOTA_EXCEEDED) {
        throw error;
      }
      
      throw new Error(`Failed to get channel stats: ${error.message}`);
    }
  }

  /**
   * Task 167: Search channels by keyword
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of channel objects
   */
  async searchChannels(query, options = {}) {
    const { maxResults = 10, order = 'relevance' } = options;

    try {
      console.log(`[YouTube API] Searching channels: "${query}"`);

      // Search for channels
      const searchResponse = await exponentialBackoff(async () => {
        return await youtube.search.list({
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: youtubeConfig.validateMaxResults(maxResults),
          order,
          regionCode: youtubeConfig.defaults.regionCode,
        });
      });

      // Task 168: Log quota cost
      quotaTracker.logCall('search.list', youtubeConfig.quotaLimits.search, true);

      // Parse search results
      const searchResults = parseSearchResults(searchResponse);
      const channelIds = searchResults
        .filter(item => item.channelId)
        .map(item => item.channelId);

      if (channelIds.length === 0) {
        return [];
      }

      // Get full channel details
      const channels = [];
      for (const channelId of channelIds) {
        try {
          const channelData = await this.getChannelStats(channelId);
          channels.push(channelData);
        } catch (error) {
          console.error(`[YouTube API] Failed to get channel ${channelId}:`, error.message);
          // Continue with other channels
        }
      }

      return channels;

    } catch (error) {
      quotaTracker.logCall('search.list', youtubeConfig.quotaLimits.search, false);
      console.error('[YouTube API] Channel search error:', error.message);
      
      if (error.message === youtubeConfig.errors.QUOTA_EXCEEDED) {
        throw error;
      }
      
      throw new Error(`Failed to search channels: ${error.message}`);
    }
  }

  /**
   * Get quota usage statistics
   * 
   * @returns {Object} Quota usage summary
   */
  getQuotaUsage() {
    return quotaTracker.getSummary();
  }

  /**
   * Reset quota tracker
   */
  resetQuota() {
    quotaTracker.reset();
  }
}

// Create singleton instance
const youtubeService = new YouTubeService();

// Export service instance and quota tracker
module.exports = {
  youtubeService,
  quotaTracker,
};