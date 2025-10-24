/**
 * React Query Client Configuration (Tasks 132-133)
 * Centralized QueryClient setup with optimized cache settings
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Task 133: Cache Time Constants
 * - staleTime: How long data is considered fresh (5 minutes)
 * - cacheTime: How long inactive data stays in cache (10 minutes)
 */
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes (renamed to gcTime in v5)
};

/**
 * Task 132: Create and configure QueryClient
 * 
 * Configuration explanation:
 * - staleTime (5 min): Data is fresh for 5 minutes, no refetch needed
 * - gcTime (10 min): Garbage collection time, cache persists for 10 minutes after last use
 * - retry: Retry failed queries up to 3 times (matches api.js retry logic)
 * - refetchOnWindowFocus: Refetch stale data when user returns to tab
 * - refetchOnReconnect: Refetch when internet connection restored
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Task 133: Cache configuration
      staleTime: CACHE_CONFIG.staleTime, // 5 minutes
      gcTime: CACHE_CONFIG.cacheTime, // 10 minutes (v5 renamed cacheTime to gcTime)
      
      // Retry configuration (matches api.js retry logic)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when reconnected to internet
      refetchOnMount: true, // Refetch on component mount if data is stale
      
      // Network mode
      networkMode: 'online', // Only fetch when online
      
      // Prevent unnecessary refetches
      refetchInterval: false, // Don't poll by default
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: 1,
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

/**
 * Task 133: Query options presets for different data types
 */
export const queryOptions = {
  /**
   * Preset for frequently changing data (e.g., trending videos)
   * Stale after 2 minutes
   */
  realtime: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  /**
   * Preset for stable data (e.g., video details)
   * Stale after 10 minutes
   */
  stable: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  /**
   * Preset for rarely changing data (e.g., channel info)
   * Stale after 30 minutes
   */
  longLived: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  /**
   * Preset for data that should always be fresh (e.g., user quota)
   * Always stale, refetch every time
   */
  alwaysFresh: {
    staleTime: 0, // Always stale
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  },
};

/**
 * Task 133: Helper function to invalidate queries by pattern
 */
export const invalidateQueries = async (queryKey) => {
  await queryClient.invalidateQueries({ queryKey });
};

/**
 * Task 133: Helper function to prefetch data
 */
export const prefetchQuery = async (queryKey, queryFn, options = {}) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    ...options,
  });
};

/**
 * Task 133: Helper function to set query data manually
 */
export const setQueryData = (queryKey, data) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * Task 133: Helper function to get cached query data
 */
export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

/**
 * Task 133: Helper function to clear all cache
 */
export const clearCache = () => {
  queryClient.clear();
};

/**
 * Development helpers
 */
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development' ||
              typeof import.meta !== 'undefined' && import.meta.env?.DEV;

if (isDev) {
  // Log cache configuration on startup
  console.log('[React Query] Configuration:', {
    staleTime: `${CACHE_CONFIG.staleTime / 1000}s`,
    gcTime: `${CACHE_CONFIG.cacheTime / 1000}s`,
    retry: 3,
  });
}

export default queryClient;