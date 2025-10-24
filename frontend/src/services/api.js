/**
 * Axios API Service (Tasks 121-130)
 * Centralized API client with automatic token refresh, retry logic, and performance monitoring
 */
import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/tokenStorage';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Task 125: Performance metrics storage
const performanceMetrics = {
  requests: [],
  
  add(metric) {
    this.requests.push(metric);
    // Keep only last 100 requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }
  },
  
  getAverage() {
    if (this.requests.length === 0) return 0;
    const total = this.requests.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / this.requests.length);
  },
  
  getSlowest() {
    if (this.requests.length === 0) return null;
    return this.requests.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
  },
  
  getAll() {
    return this.requests;
  },
  
  clear() {
    this.requests = [];
  }
};

// Task 129: Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Retryable HTTP status codes
};

/**
 * Task 129: Exponential backoff delay calculation
 */
const getRetryDelay = (retryCount) => {
  return RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // 1s, 2s, 4s
};

/**
 * Task 129: Check if error is retryable
 */
const isRetryableError = (error) => {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }
  
  // Specific HTTP status codes
  return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
};

/**
 * Task 122-123: Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Task 124-125: Request Interceptor with timing
 * Automatically attaches JWT token and tracks request timing
 */
api.interceptors.request.use(
  (config) => {
    // Task 125: Add start time for performance monitoring
    config.metadata = { startTime: Date.now() };
    
    // Task 124: Get token from storage
    const token = getToken();
    
    // Attach token to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Task 126-128: Response Interceptor
 * Handles automatic token refresh, error responses, and performance tracking
 */
api.interceptors.response.use(
  (response) => {
    // Task 125: Calculate request duration
    if (response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      
      // Store performance metric
      performanceMetrics.add({
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        status: response.status,
        duration,
        timestamp: new Date(),
      });
      
      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.status} ${response.config.url} (${duration}ms)`);
      }
      
      // Warn if request is slow (> 3 seconds)
      if (duration > 3000) {
        console.warn(`[Slow Request] ${response.config.url} took ${duration}ms`);
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Task 125: Track failed request timing
    if (originalRequest?.metadata?.startTime) {
      const duration = Date.now() - originalRequest.metadata.startTime;
      
      performanceMetrics.add({
        url: originalRequest.url,
        method: originalRequest.method?.toUpperCase(),
        status: error.response?.status || 0,
        duration,
        timestamp: new Date(),
        error: true,
      });
    }
    
    // Task 129: Implement retry logic for network errors
    if (isRetryableError(error) && !originalRequest._isRetry) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      if (originalRequest._retryCount < RETRY_CONFIG.maxRetries) {
        originalRequest._retryCount++;
        originalRequest._isRetry = true;
        
        const delay = getRetryDelay(originalRequest._retryCount);
        
        console.log(
          `[Retry ${originalRequest._retryCount}/${RETRY_CONFIG.maxRetries}] ` +
          `${originalRequest.url} after ${delay}ms`
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return api(originalRequest);
      } else {
        console.error(`[Max Retries Exceeded] ${originalRequest.url}`);
      }
    }
    
    // Task 127: Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._tokenRefreshAttempted) {
      originalRequest._tokenRefreshAttempted = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/guest/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        
        if (refreshResponse.data?.data?.token) {
          const newToken = refreshResponse.data.data.token;
          
          // Store new token
          setToken(newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Token Refresh Failed]', refreshError);
        
        // Clear invalid token
        removeToken();
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Task 128: Handle 429 Too Many Requests - Quota exceeded
    if (error.response?.status === 429) {
      console.error('[Rate Limit] Too many requests');
      
      // Dispatch custom event for UI to show notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quota-exceeded', {
          detail: { 
            message: error.response?.data?.error || 'Rate limit exceeded',
            retryAfter: error.response?.headers['retry-after']
          }
        }));
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('[Network Error]', error.message);
      
      // Dispatch network error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('network-error', {
          detail: { message: 'Network connection failed' }
        }));
      }
    }
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
        retries: originalRequest?._retryCount || 0,
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Task 130: API helper methods
 */
export const apiService = {
  /**
   * GET request
   */
  get: (url, config = {}) => api.get(url, config),
  
  /**
   * POST request
   */
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  /**
   * PUT request
   */
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  /**
   * PATCH request
   */
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  /**
   * DELETE request
   */
  delete: (url, config = {}) => api.delete(url, config),
};

/**
 * Task 130: Auth-specific API methods
 */
export const authAPI = {
  /**
   * Create guest session
   */
  createGuestSession: () => api.post('/auth/guest'),
  
  /**
   * Refresh guest session
   */
  refreshSession: () => api.post('/auth/guest/refresh'),
  
  /**
   * Verify token
   */
  verifyToken: () => api.get('/auth/verify'),
  
  /**
   * Logout
   */
  logout: () => api.post('/auth/logout'),
};

/**
 * Task 130: YouTube API methods
 */
export const youtubeAPI = {
  /**
   * Search videos
   */
  searchVideos: (params) => api.get('/youtube/search', { params }),
  
  /**
   * Get video details
   */
  getVideo: (videoId) => api.get(`/youtube/video/${videoId}`),
  
  /**
   * Get channel details
   */
  getChannel: (channelId) => api.get(`/youtube/channel/${channelId}`),
  
  /**
   * Get trending videos
   */
  getTrending: (region = 'US') => api.get(`/youtube/trending?region=${region}`),
};

/**
 * Task 125 & 130: Performance monitoring utilities
 */
export const performanceAPI = {
  /**
   * Get all performance metrics
   */
  getMetrics: () => performanceMetrics.getAll(),
  
  /**
   * Get average response time
   */
  getAverageResponseTime: () => performanceMetrics.getAverage(),
  
  /**
   * Get slowest request
   */
  getSlowestRequest: () => performanceMetrics.getSlowest(),
  
  /**
   * Clear all metrics
   */
  clearMetrics: () => performanceMetrics.clear(),
  
  /**
   * Get metrics summary
   */
  getSummary: () => {
    const metrics = performanceMetrics.getAll();
    
    return {
      totalRequests: metrics.length,
      averageResponseTime: performanceMetrics.getAverage(),
      slowestRequest: performanceMetrics.getSlowest(),
      failedRequests: metrics.filter(m => m.error).length,
      successfulRequests: metrics.filter(m => !m.error).length,
    };
  }
};

/**
 * Task 130: Error utilities
 */
export const errorUtils = {
  /**
   * Check if error is a network error
   */
  isNetworkError: (error) => !error.response,
  
  /**
   * Check if error is authentication error
   */
  isAuthError: (error) => error.response?.status === 401,
  
  /**
   * Check if error is rate limit error
   */
  isRateLimitError: (error) => error.response?.status === 429,
  
  /**
   * Get error message
   */
  getErrorMessage: (error) => {
    if (!error.response) {
      return 'Network connection failed';
    }
    return error.response?.data?.error || error.response?.data?.message || error.message;
  },
};

// Export configured axios instance as default
export default api;