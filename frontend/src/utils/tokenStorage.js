/**
 * Token Storage Utilities (Tasks 111-120)
 * Manages JWT token storage, retrieval, and validation
 */

// Storage keys
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Task 112: getToken() - reads from localStorage with fallback
 * Retrieves the stored JWT token
 * 
 * @returns {string|null} JWT token or null if not found
 * 
 * @example
 * const token = getToken();
 * if (token) {
 *   // Use token
 * }
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Task 119: Validate token before returning
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('Token is expired, removing...');
      removeToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

/**
 * Task 113: setToken(token) - stores with expiry check
 * Stores JWT token in localStorage with expiry timestamp
 * 
 * @param {string} token - JWT token to store
 * @param {number} expiresIn - Expiration time in seconds (default: 24 hours)
 * @returns {boolean} Success status
 * 
 * @example
 * const success = setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const setToken = (token, expiresIn = 24 * 60 * 60) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    // Task 119: Validate token format
    if (!isValidTokenFormat(token)) {
      throw new Error('Invalid token format: must be a valid JWT');
    }

    // Calculate expiry time
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    
    // Store token and expiry
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    
    return true;
  } catch (error) {
    // Task 118: Handle QuotaExceededError
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Clearing old data...');
      
      // Try to clear old data and retry
      try {
        localStorage.clear();
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, new Date(Date.now() + expiresIn * 1000).toISOString());
        return true;
      } catch (retryError) {
        console.error('Failed to store token even after clearing:', retryError);
        return false;
      }
    }
    
    console.error('Error storing token:', error);
    return false;
  }
};

/**
 * Task 114: removeToken() - clears localStorage
 * Removes token and expiry from localStorage
 * 
 * @returns {boolean} Success status
 * 
 * @example
 * removeToken(); // Clears auth token
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Task 115: isTokenExpired(token) - decodes and checks exp claim
 * Checks if a JWT token is expired
 * 
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired, false otherwise
 * 
 * @example
 * if (isTokenExpired(token)) {
 *   console.log('Token expired, please login again');
 * }
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) {
      return true;
    }

    // Get token payload
    const payload = getTokenPayload(token);
    
    if (!payload || !payload.exp) {
      return true;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Task 116: getTokenPayload(token) - extracts user info
 * Decodes JWT token and returns payload
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null
 * 
 * @example
 * const payload = getTokenPayload(token);
 * console.log(payload.userId, payload.userType);
 */
export const getTokenPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    
    // Base64 decode
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
};

/**
 * Task 119: Validate token format
 * Checks if string is a valid JWT format
 * 
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid JWT format
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be base64 encoded (not empty)
  return parts.every(part => part.length > 0);
};

/**
 * Get token expiry time
 * Returns the stored expiry timestamp
 * 
 * @returns {Date|null} Expiry date or null
 */
export const getTokenExpiry = () => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

/**
 * Get time remaining until token expires
 * 
 * @returns {number} Milliseconds until expiry (0 if expired)
 */
export const getTokenTimeRemaining = () => {
  const expiry = getTokenExpiry();
  
  if (!expiry) {
    return 0;
  }

  const timeRemaining = expiry.getTime() - Date.now();
  return Math.max(0, timeRemaining);
};

/**
 * Check if token needs refresh
 * Returns true if token will expire in less than 1 hour
 * 
 * @returns {boolean} True if refresh needed
 */
export const shouldRefreshToken = () => {
  const timeRemaining = getTokenTimeRemaining();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return timeRemaining > 0 && timeRemaining < oneHour;
};

/**
 * Get all token info for debugging
 * 
 * @returns {Object} Token information
 */
export const getTokenInfo = () => {
  const token = getToken();
  
  if (!token) {
    return {
      hasToken: false,
      isExpired: true,
      payload: null,
      timeRemaining: 0,
    };
  }

  return {
    hasToken: true,
    isExpired: isTokenExpired(token),
    payload: getTokenPayload(token),
    timeRemaining: getTokenTimeRemaining(),
    expiryDate: getTokenExpiry(),
    shouldRefresh: shouldRefreshToken(),
  };
};

// Default export for convenience
export default {
  getToken,
  setToken,
  removeToken,
  isTokenExpired,
  getTokenPayload,
  isValidTokenFormat,
  getTokenExpiry,
  getTokenTimeRemaining,
  shouldRefreshToken,
  getTokenInfo,
};