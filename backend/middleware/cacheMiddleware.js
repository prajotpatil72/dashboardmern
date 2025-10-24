/**
 * Cache Middleware (Tasks 193-196)
 * Implements caching layer for YouTube API responses
 */

const Cache = require('../models/Cache');

/**
 * Task 194: Cache TTL Configuration (in seconds)
 */
const CACHE_TTL = {
  video: 3600,        // 1 hour (video details don't change often)
  channel: 21600,     // 6 hours (channel stats change slowly)
  search: 1800,       // 30 minutes (search results can change)
  trending: 900       // 15 minutes (trending changes frequently)
};

/**
 * Task 195: Generate Cache Key
 * Creates a unique key based on endpoint and parameters
 * 
 * @param {string} endpoint - Endpoint type (search, video, channel, trending)
 * @param {Object} params - Request parameters
 * @returns {string} Cache key
 */
const generateCacheKey = (endpoint, params) => {
  // Sort params to ensure consistent keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${endpoint}:${JSON.stringify(sortedParams)}`;
};

/**
 * Task 193: Cache Middleware
 * Checks cache before making API call
 * 
 * @param {string} endpointType - Type of endpoint (search, video, channel, trending)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (endpointType) => {
  return async (req, res, next) => {
    try {
      // Generate cache key based on request
      let params = {};
      
      if (endpointType === 'search') {
        params = { q: req.query.q, maxResults: req.query.maxResults, type: req.query.type };
      } else if (endpointType === 'video') {
        params = { videoId: req.params.videoId };
      } else if (endpointType === 'channel') {
        params = { channelId: req.params.channelId };
      } else if (endpointType === 'trending') {
        params = { regionCode: req.query.regionCode, maxResults: req.query.maxResults };
      }

      const cacheKey = generateCacheKey(endpointType, params);

      // Check cache
      const cachedData = await Cache.get(cacheKey);

      if (cachedData) {
        // Cache HIT
        console.log(`[Cache HIT] ${cacheKey}`);
        
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Track cache hit for analytics
        req.cacheHit = true;
        req.cacheKey = cacheKey;

        // Return cached data
        return res.status(200).json({
          success: true,
          data: cachedData,
          cached: true,
          cacheKey
        });
      }

      // Cache MISS - continue to actual API call
      console.log(`[Cache MISS] ${cacheKey}`);
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      
      // Track cache miss
      req.cacheMiss = true;
      req.cacheKey = cacheKey;
      req.cacheEndpoint = endpointType;

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);
      
      res.json = async function(data) {
        // Task 196: Store successful responses in cache
        if (data.success && data.data) {
          try {
            const ttl = CACHE_TTL[endpointType] || 1800;
            await Cache.set(cacheKey, data.data, ttl, endpointType);
            console.log(`[Cache STORE] ${cacheKey} (TTL: ${ttl}s)`);
          } catch (error) {
            console.error('[Cache STORE Error]:', error.message);
          }
        }
        
        // Call original json method
        return originalJson(data);
      };

      next();

    } catch (error) {
      console.error('[Cache Middleware Error]:', error.message);
      // Don't fail the request, just skip cache
      next();
    }
  };
};

/**
 * Task 198: Cache Analytics Logger
 * Logs cache hits and misses for monitoring
 */
const logCacheAnalytics = async (req, res, next) => {
  res.on('finish', () => {
    if (req.cacheHit) {
      console.log(`[Analytics] Cache HIT - ${req.cacheKey}`);
    } else if (req.cacheMiss) {
      console.log(`[Analytics] Cache MISS - ${req.cacheKey}`);
    }
  });
  
  next();
};

module.exports = {
  cacheMiddleware,
  logCacheAnalytics,
  generateCacheKey,
  CACHE_TTL
};