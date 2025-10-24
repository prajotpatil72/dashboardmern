/**
 * useTrendingVideos Hook
 * Task 226, 227-230
 * 
 * Fetches trending YouTube videos
 */

import { useQuery } from '@tanstack/react-query';
import { youtubeAPI } from '../api/youtube';
import { queryKeys } from '../constants/queryKeys';
import { STALE_TIMES, CACHE_TIMES } from '../constants/cacheConfig';

/**
 * @typedef {Object} TrendingParams
 * @property {string} [regionCode='US'] - ISO 3166-1 alpha-2 country code
 * @property {string} [videoCategoryId] - Category ID to filter by
 * @property {number} [maxResults=25] - Maximum results to return
 */

/**
 * @typedef {Object} TrendingResult
 * @property {Array} items - Trending video items
 * @property {Object} pageInfo - Pagination information
 * @property {string} [nextPageToken] - Token for next page
 */

/**
 * @typedef {Object} UseTrendingVideosReturn
 * @property {TrendingResult} data - Trending videos
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {boolean} isFetching - Fetching state
 * @property {Function} refetch - Manual refetch function
 */

/**
 * Fetch trending YouTube videos
 * 
 * @param {TrendingParams} [params={}] - Trending parameters
 * @param {Object} [options={}] - Additional query options
 * @returns {UseTrendingVideosReturn} Query result
 * 
 * @example
 * const { data: trending, isLoading } = useTrendingVideos({ 
 *   regionCode: 'US', 
 *   maxResults: 50 
 * });
 */
export const useTrendingVideos = (params = {}, options = {}) => {
  const { regionCode = 'US', videoCategoryId = 'all' } = params;

  return useQuery({
    // Task 222: Proper query key using existing structure
    queryKey: queryKeys.youtube.trending(regionCode, videoCategoryId),
    
    // Query function
    queryFn: async () => {
      const response = await youtubeAPI.getTrending(params);
      return response.data;
    },
    
    // Trending is always enabled by default
    enabled: true,
    
    // Task 229: Trending changes frequently, shorter cache
    staleTime: STALE_TIMES.TRENDING_VIDEOS,
    gcTime: CACHE_TIMES.TRENDING_VIDEOS,
    
    // Task 227: Error handling with retry logic
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry server errors
      return failureCount < 3; // More retries for trending
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Trending should refetch more often
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
    // Auto-refresh every 5 minutes
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: false,
    
    // Allow custom options override
    ...options,
  });
};

export default useTrendingVideos;