/**
 * useSearchVideos Hook
 * Tasks 221-223, 227-230
 * 
 * React Query hook for searching YouTube videos
 * Features:
 * - Conditional fetching (only when query exists)
 * - Automatic retry on failure
 * - Optimized caching
 * - Comprehensive error handling
 */

import { useQuery } from '@tanstack/react-query';
import { youtubeAPI } from '../api/youtube';
import { queryKeys } from '../constants/queryKeys';
import { STALE_TIMES, CACHE_TIMES } from '../constants/cacheConfig';

/**
 * @typedef {Object} SearchParams
 * @property {string} q - Search query
 * @property {number} [maxResults=10] - Maximum results to return
 * @property {string} [order='relevance'] - Sort order
 * @property {string} [type='video'] - Resource type
 */

/**
 * @typedef {Object} SearchResult
 * @property {Array} items - Video items
 * @property {Object} pageInfo - Pagination info
 * @property {string} [nextPageToken] - Token for next page
 * @property {string} [prevPageToken] - Token for previous page
 */

/**
 * @typedef {Object} UseSearchVideosReturn
 * @property {SearchResult} data - Search results
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {boolean} isFetching - Fetching state (includes background refetch)
 * @property {Function} refetch - Manual refetch function
 */

/**
 * Custom hook to search YouTube videos
 * 
 * @param {SearchParams} params - Search parameters
 * @returns {UseSearchVideosReturn} Query result with data and states
 * 
 * @example
 * const { data, isLoading, isError } = useSearchVideos({ 
 *   q: 'react tutorial', 
 *   maxResults: 20 
 * });
 */
export const useSearchVideos = (params = {}) => {
  const { q: query, ...restParams } = params;

  return useQuery({
    // Task 222: Proper query key structure using existing queryKeys
    queryKey: queryKeys.youtube.search('videos', query || '', restParams),
    
    // Query function
    queryFn: async () => {
      const response = await youtubeAPI.search(params);
      return response.data;
    },
    
    // Task 223: Only run when query is not empty
    enabled: Boolean(query && query.trim().length > 0),
    
    // Task 229: Cache configuration
    staleTime: STALE_TIMES.SEARCH_RESULTS,
    gcTime: CACHE_TIMES.SEARCH_RESULTS,
    
    // Task 227: Error handling with retry logic
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Task 228: Expose loading and error states (handled by useQuery return)
    
    // Additional optimizations
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

export default useSearchVideos;