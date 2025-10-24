/**
 * Cache Warming Service (Task 197)
 * Pre-populates cache with popular queries
 */

const Cache = require('../models/Cache');
const { youtubeService } = require('./youtubeService');
const { CACHE_TTL } = require('../middleware/cacheMiddleware');

/**
 * Popular search queries to pre-cache
 */
const POPULAR_QUERIES = [
  'javascript tutorial',
  'react tutorial',
  'node.js tutorial',
  'python programming',
  'web development',
  'coding for beginners',
  'javascript course',
  'react hooks',
  'mongodb tutorial',
  'express.js tutorial'
];

/**
 * Popular video IDs to pre-cache
 */
const POPULAR_VIDEOS = [
  'dQw4w9WgXcQ', // Never Gonna Give You Up
  // Add more popular video IDs as needed
];

/**
 * Popular channel IDs to pre-cache
 */
const POPULAR_CHANNELS = [
  'UCXuqSBlHAE6Xw-yeJA0Tunw', // Linus Tech Tips
  'UCWv7vMbMWH4-V0ZXdmDpPBA', // Programming with Mosh
  // Add more popular channel IDs as needed
];

/**
 * Warm cache for search queries
 */
async function warmSearchCache() {
  console.log('[Cache Warming] Starting search cache warming...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const query of POPULAR_QUERIES) {
    try {
      const results = await youtubeService.searchVideos(query, { maxResults: 10 });
      const cacheKey = `search:${JSON.stringify({ q: query, maxResults: 10 })}`;
      
      await Cache.set(cacheKey, { results, count: results.length, query }, CACHE_TTL.search, 'search');
      
      successCount++;
      console.log(`[Cache Warming] ✓ Cached search: "${query}"`);
    } catch (error) {
      errorCount++;
      console.error(`[Cache Warming] ✗ Failed search: "${query}" - ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[Cache Warming] Search complete: ${successCount} success, ${errorCount} errors`);
}

/**
 * Warm cache for popular videos
 */
async function warmVideoCache() {
  console.log('[Cache Warming] Starting video cache warming...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const videoId of POPULAR_VIDEOS) {
    try {
      const video = await youtubeService.getVideoDetails(videoId);
      const cacheKey = `video:${JSON.stringify({ videoId })}`;
      
      await Cache.set(cacheKey, { video }, CACHE_TTL.video, 'video');
      
      successCount++;
      console.log(`[Cache Warming] ✓ Cached video: ${videoId}`);
    } catch (error) {
      errorCount++;
      console.error(`[Cache Warming] ✗ Failed video: ${videoId} - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[Cache Warming] Video complete: ${successCount} success, ${errorCount} errors`);
}

/**
 * Warm cache for popular channels
 */
async function warmChannelCache() {
  console.log('[Cache Warming] Starting channel cache warming...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const channelId of POPULAR_CHANNELS) {
    try {
      const channel = await youtubeService.getChannelStats(channelId);
      const cacheKey = `channel:${JSON.stringify({ channelId })}`;
      
      await Cache.set(cacheKey, { channel }, CACHE_TTL.channel, 'channel');
      
      successCount++;
      console.log(`[Cache Warming] ✓ Cached channel: ${channelId}`);
    } catch (error) {
      errorCount++;
      console.error(`[Cache Warming] ✗ Failed channel: ${channelId} - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[Cache Warming] Channel complete: ${successCount} success, ${errorCount} errors`);
}

/**
 * Run all cache warming tasks
 */
async function warmAllCaches() {
  console.log('[Cache Warming] Starting comprehensive cache warming...\n');
  
  const startTime = Date.now();

  try {
    await warmSearchCache();
    await warmVideoCache();
    await warmChannelCache();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n[Cache Warming] ✓ Complete in ${duration}s`);
    
    // Get cache stats
    const stats = await Cache.getStats();
    console.log(`[Cache Stats] Active: ${stats.active}, Total Hits: ${stats.totalHits}`);
    
  } catch (error) {
    console.error('[Cache Warming] ✗ Error:', error.message);
  }
}

module.exports = {
  warmAllCaches,
  warmSearchCache,
  warmVideoCache,
  warmChannelCache
};