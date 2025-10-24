/**
 * YouTube API Client - Fixed version with debugging
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

console.log('[YouTube API] Base URL:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[YouTube API] Making request:', config.method.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('[YouTube API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[YouTube API] Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[YouTube API] Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export const youtubeAPI = {
  /**
   * Search for videos by keyword
   */
  search: async (params) => {
    console.log('[YouTube API] Searching with params:', params);
    try {
      const response = await apiClient.get('/youtube/search', { params });
      console.log('[YouTube API] Search response:', response.data);
      return response;
    } catch (error) {
      console.error('[YouTube API] Search failed:', error);
      throw error;
    }
  },

  /**
   * Get video details by ID
   */
  getVideo: async (videoId) => {
    console.log('[YouTube API] Getting video:', videoId);
    try {
      const response = await apiClient.get(`/youtube/video/${videoId}`);
      console.log('[YouTube API] Video response:', response.data);
      return response;
    } catch (error) {
      console.error('[YouTube API] Get video failed:', error);
      throw error;
    }
  },

  /**
   * Get channel statistics
   */
  getChannel: async (channelId) => {
    console.log('[YouTube API] Getting channel:', channelId);
    try {
      const response = await apiClient.get(`/youtube/channel/${channelId}`);
      console.log('[YouTube API] Channel response:', response.data);
      return response;
    } catch (error) {
      console.error('[YouTube API] Get channel failed:', error);
      throw error;
    }
  },

  /**
   * Get trending videos
   */
  getTrending: async (params = {}) => {
    const { maxResults = 20, regionCode = 'US' } = params;
    console.log('[YouTube API] Getting trending videos:', { maxResults, regionCode });
    try {
      const response = await apiClient.get('/youtube/trending', {
        params: {
          maxResults,
          regionCode
        }
      });
      console.log('[YouTube API] Trending response:', response.data);
      return response;
    } catch (error) {
      console.error('[YouTube API] Get trending failed:', error);
      throw error;
    }
  },
};

export default youtubeAPI;