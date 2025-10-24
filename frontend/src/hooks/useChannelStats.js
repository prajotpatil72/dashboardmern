/**
 * useChannelStats Hook
 * Task 225, 227-230
 * 
 * Fetches channel statistics and information
 */

import { useQuery } from '@tanstack/react-query';
import { youtubeAPI } from '../api/youtube';
import { queryKeys } from '../constants/queryKeys';
import { STALE_TIMES, CACHE_TIMES } from '../constants/cacheConfig';

/**
 * @typedef {Object} ChannelStats
 * @property {string} id - Channel ID
 * @property {Object} snippet - Channel snippet (title, description, thumbnails)
 * @property {Object} statistics - Channel statistics
 * @property {string} statistics.subscriberCount - Subscriber count
 * @property {string} statistics.viewCount - Total view count
 * @property {string} statistics.videoCount - Video count
 * @property {Object} brandingSettings - Branding information
 */

/**
 * @typedef {Object} UseChannelStatsReturn
 * @property {ChannelStats} data - Channel statistics
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {boolean} isFetching - Fetching state
 * @property {Function} refetch - Manual refetch function
 */

/**
 * Fetch channel statistics and information
 * 
 * @param {string} channelId - YouTube channel ID
 * @param {Object} [options] - Additional query options
 * @returns {UseChannelStatsReturn} Query result
 * 
 * @example
 * const { data: channel, isLoading } = useChannelStats('UCXuqSBlHAE6Xw-yeJA0Tunw');
 */
export const useChannelStats = (channelId, options = {}) => {
  return useQuery({
    // Task 222: Proper query key using existing structure
    queryKey: queryKeys.youtube.channel(channelId),
    
    // Query function
    queryFn: async () => {
      const response = await youtubeAPI.getChannel(channelId);
      return response.data;
    },
    
    // Only fetch when channelId exists
    enabled: Boolean(channelId),
    
    // Task 229: Channel stats update less frequently
    staleTime: STALE_TIMES.CHANNEL_STATS,
    gcTime: CACHE_TIMES.CHANNEL_STATS,
    
    // Task 227: Error handling with retry logic
    retry: (failureCount, error) => {
      // Don't retry on 4xx client errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times on 5xx server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Optimization settings
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    
    // Allow custom options override
    ...options,
  });
};

export default useChannelStats;