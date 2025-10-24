/**
 * Task 90: API Endpoints Configuration
 * Centralized API endpoint constants
 */

// Base URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API Version
export const API_VERSION = '/api/v1';

// Full API URL
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  GUEST_LOGIN: `${API_URL}/auth/guest`,
  REFRESH_SESSION: `${API_URL}/auth/refresh`,
  LOGOUT: `${API_URL}/auth/logout`,
};

/**
 * YouTube API Endpoints
 */
export const YOUTUBE_ENDPOINTS = {
  SEARCH: `${API_URL}/youtube/search`,
  VIDEO_DETAILS: (videoId) => `${API_URL}/youtube/video/${videoId}`,
  CHANNEL_DETAILS: (channelId) => `${API_URL}/youtube/channel/${channelId}`,
  TRENDING: `${API_URL}/youtube/trending`,
};

/**
 * User Endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: `${API_URL}/user/profile`,
  QUOTA: `${API_URL}/user/quota`,
  SEARCH_HISTORY: `${API_URL}/user/search-history`,
};

/**
 * Health Check
 */
export const HEALTH_ENDPOINT = `${API_BASE_URL}/api/health`;

/**
 * Request timeout (milliseconds)
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Default request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};