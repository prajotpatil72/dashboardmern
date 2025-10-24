/**
 * React Query Cache Configuration
 * Tasks 229
 * 
 * Cache and stale time constants for different data types
 */

/**
 * Cache time constants (in milliseconds)
 * How long data stays in cache before being garbage collected
 */
export const CACHE_TIMES = {
  // Video data changes rarely
  VIDEO_DETAILS: 1000 * 60 * 30, // 30 minutes
  
  // Channel stats update occasionally
  CHANNEL_STATS: 1000 * 60 * 15, // 15 minutes
  
  // Search results can be cached briefly
  SEARCH_RESULTS: 1000 * 60 * 5, // 5 minutes
  
  // Trending changes frequently
  TRENDING_VIDEOS: 1000 * 60 * 2, // 2 minutes
  
  // Cache stats are real-time
  CACHE_STATS: 1000 * 30, // 30 seconds
};

/**
 * Stale time constants (in milliseconds)
 * Data is considered fresh during this period
 */
export const STALE_TIMES = {
  VIDEO_DETAILS: 1000 * 60 * 20, // 20 minutes
  CHANNEL_STATS: 1000 * 60 * 10, // 10 minutes
  SEARCH_RESULTS: 1000 * 60 * 3, // 3 minutes
  TRENDING_VIDEOS: 1000 * 60 * 1, // 1 minute
  CACHE_STATS: 1000 * 15, // 15 seconds
};