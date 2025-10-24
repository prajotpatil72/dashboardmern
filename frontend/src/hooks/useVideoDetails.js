/**
 * useVideoDetails Hook
 * Task 224, 227-230
 * 
 * Fetches detailed information for a single video
 */

import { useQuery } from '@tanstack/react-query';
import { youtubeAPI } from '../api/youtube';
import { queryKeys } from '../constants/queryKeys';
import { STALE_TIMES, CACHE_TIMES } from '../constants/cacheConfig';

/**
 * @typedef {Object} VideoDetails
 * @property {string} id - Video ID
 * @property {Object} snippet - Video snippet (title, description, etc.)
 * @property {Object} statistics - Video stats (views, likes, etc.)
 * @property {Object} contentDetails - Video details (duration, definition, etc.)
 */

/**
 * @typedef {Object} UseVideoDetailsReturn
 * @property {VideoDetails} data - Video details
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {boolean} isFetching - Fetching state
 * @property {Function} refetch - Manual refetch function
 */

/**
 * Fetch detailed information for a single video
 * 
 * @param {string} videoId - YouTube video ID
 * @param {Object} [options] - Additional query options
 * @returns {UseVideoDetailsReturn} Query result
 * 
 * @example
 * const { data: video, isLoading } = useVideoDetails('dQw4w9WgXcQ');
 */
export const useVideoDetails = (videoId, options = {}) => {
  return useQuery({
    // Task 222: Proper query key using existing queryKeys structure
    queryKey: queryKeys.youtube.video(videoId),
    
    // Query function
    queryFn: async () => {
      const response = await youtubeAPI.getVideo(videoId);
      return response.data;
    },
    
    // Only fetch when videoId exists
    enabled: Boolean(videoId),
    
    // Task 229: Video details are relatively stable
    staleTime: STALE_TIMES.VIDEO_DETAILS,
    gcTime: CACHE_TIMES.VIDEO_DETAILS,
    
    // Task 227: Error handling
    retry: (failureCount, error) => {
      // Don't retry on 404 or other 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Optimizations
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    
    // Allow custom options to override
    ...options,
  });
};

export default useVideoDetails;