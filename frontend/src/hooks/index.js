/**
 * Hooks Index
 * Task 230: Export all custom hooks with TypeScript-style JSDoc types
 * 
 * Centralized export for all React Query hooks
 */

export { useSearchVideos } from './useSearchVideos';
export { useVideoDetails } from './useVideoDetails';
export { useChannelStats } from './useChannelStats';
export { useTrendingVideos } from './useTrendingVideos';

// Re-export defaults for convenience
export { default as useSearchVideosDefault } from './useSearchVideos';
export { default as useVideoDetailsDefault } from './useVideoDetails';
export { default as useChannelStatsDefault } from './useChannelStats';
export { default as useTrendingVideosDefault } from './useTrendingVideos';