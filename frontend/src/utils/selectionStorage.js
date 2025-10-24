/**
 * Selection Storage Utility
 * Task 239: localStorage persistence with 24h expiration
 * 
 * Handles saving and loading selected videos with automatic expiration
 */

const STORAGE_KEY = 'youtube_selected_videos';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Storage data structure
 * @typedef {Object} StoredSelectionData
 * @property {Array} selectedVideos - Array of selected video objects
 * @property {string} searchQuery - Search query used
 * @property {string} searchType - Type of search
 * @property {number} totalResults - Total results count
 * @property {number} timestamp - When data was saved
 * @property {number} expiresAt - When data expires
 */

/**
 * Save selection data to localStorage
 * Task 239: Persist with 24h expiry
 * 
 * @param {Object} data - Selection data to save
 * @param {Array} data.selectedVideos - Selected videos
 * @param {string} data.searchQuery - Search query
 * @param {string} data.searchType - Search type
 * @param {number} data.totalResults - Total results
 */
export const saveSelection = (data) => {
  try {
    const now = Date.now();
    const storageData = {
      ...data,
      timestamp: now,
      expiresAt: now + EXPIRATION_TIME,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[SelectionStorage] Saved:', {
        videoCount: data.selectedVideos?.length || 0,
        expiresIn: formatTime(EXPIRATION_TIME),
      });
    }
  } catch (error) {
    console.error('[SelectionStorage] Save failed:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.warn('[SelectionStorage] Storage quota exceeded, clearing old data');
      clearSelection();
    }
  }
};

/**
 * Load selection data from localStorage
 * Task 239: Load with expiration check
 * 
 * @returns {StoredSelectionData|null} Stored data or null if expired/invalid
 */
export const loadSelection = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);
    const now = Date.now();

    // Check if data has expired
    if (data.expiresAt && now > data.expiresAt) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SelectionStorage] Data expired, clearing');
      }
      clearSelection();
      return null;
    }

    // Validate data structure
    if (!data.selectedVideos || !Array.isArray(data.selectedVideos)) {
      console.warn('[SelectionStorage] Invalid data structure, clearing');
      clearSelection();
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      const timeRemaining = data.expiresAt - now;
      console.log('[SelectionStorage] Loaded:', {
        videoCount: data.selectedVideos.length,
        expiresIn: formatTime(timeRemaining),
      });
    }

    return {
      selectedVideos: data.selectedVideos || [],
      searchQuery: data.searchQuery || '',
      searchType: data.searchType || '',
      totalResults: data.totalResults || 0,
      timestamp: data.timestamp,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('[SelectionStorage] Load failed:', error);
    clearSelection();
    return null;
  }
};

/**
 * Clear selection data from localStorage
 */
export const clearSelection = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (process.env.NODE_ENV === 'development') {
      console.log('[SelectionStorage] Cleared');
    }
  } catch (error) {
    console.error('[SelectionStorage] Clear failed:', error);
  }
};

/**
 * Check if selection data exists and is valid
 * 
 * @returns {boolean} True if valid data exists
 */
export const hasValidSelection = () => {
  const data = loadSelection();
  return data !== null && data.selectedVideos.length > 0;
};

/**
 * Get time remaining until expiration
 * 
 * @returns {number|null} Milliseconds until expiration, or null if no data
 */
export const getTimeUntilExpiration = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (!data.expiresAt) return null;

    const remaining = data.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
};

/**
 * Format time in milliseconds to human-readable string
 * 
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
const formatTime = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Development helper: Get storage info
 */
export const getStorageInfo = () => {
  const data = loadSelection();
  
  if (!data) {
    return { exists: false };
  }

  const now = Date.now();
  const age = now - data.timestamp;
  const remaining = data.expiresAt - now;

  return {
    exists: true,
    videoCount: data.selectedVideos.length,
    searchQuery: data.searchQuery,
    searchType: data.searchType,
    age: formatTime(age),
    remaining: formatTime(remaining),
    timestamp: new Date(data.timestamp).toLocaleString(),
    expiresAt: new Date(data.expiresAt).toLocaleString(),
  };
};

// Make storage info available in dev tools
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__getSelectionStorageInfo = getStorageInfo;
  console.log('[SelectionStorage] Dev helper available: window.__getSelectionStorageInfo()');
}