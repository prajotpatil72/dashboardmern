/**
 * SelectionContext - Tasks 231-240 - FIXED
 * Manages selected videos with localStorage persistence
 * FIXED: Uses videoId instead of id to match backend structure
 * 
 * Features:
 * - Video selection management (add, remove, toggle, clear, selectAll)
 * - Search metadata tracking
 * - localStorage persistence with 24h expiration
 * - Memoized selectors for performance
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { saveSelection, loadSelection, clearSelection as clearStoredSelection } from '../utils/selectionStorage';

// Task 231: Create SelectionContext
const SelectionContext = createContext(null);

/**
 * Helper function to get video ID from any video object
 * Handles both flat structure (videoId) and nested structure (id.videoId or id)
 */
const getVideoId = (video) => {
  if (!video) return null;
  return video.videoId || video.id?.videoId || video.id;
};

/**
 * Task 231-240: SelectionProvider component
 * Provides selection state and methods to all children
 */
export const SelectionProvider = ({ children }) => {
  // Task 232: State structure
  const [state, setState] = useState({
    selectedVideos: [],
    searchQuery: '',
    searchType: '',
    totalResults: 0,
  });

  // Task 239: Load from localStorage on mount
  useEffect(() => {
    const stored = loadSelection();
    if (stored) {
      setState({
        selectedVideos: stored.selectedVideos,
        searchQuery: stored.searchQuery,
        searchType: stored.searchType,
        totalResults: stored.totalResults,
      });
    }
  }, []);

  // Task 239: Save to localStorage whenever state changes
  useEffect(() => {
    if (state.selectedVideos.length > 0) {
      saveSelection(state);
    } else {
      clearStoredSelection();
    }
  }, [state]);

  // Task 233: Add video to selection
  const addVideo = useCallback((video) => {
    setState((prev) => {
      const videoId = getVideoId(video);
      // Don't add if already exists
      if (prev.selectedVideos.find((v) => getVideoId(v) === videoId)) {
        return prev;
      }
      return {
        ...prev,
        selectedVideos: [...prev.selectedVideos, video],
      };
    });
  }, []);

  // Task 234: Remove video from selection
  const removeVideo = useCallback((videoId) => {
    setState((prev) => ({
      ...prev,
      selectedVideos: prev.selectedVideos.filter((v) => getVideoId(v) !== videoId),
    }));
  }, []);

  // Task 235: Toggle video selection - FIXED to use videoId
  const toggleVideo = useCallback((video) => {
    setState((prev) => {
      const videoId = getVideoId(video);
      const exists = prev.selectedVideos.find((v) => getVideoId(v) === videoId);
      
      if (exists) {
        // Remove if exists
        return {
          ...prev,
          selectedVideos: prev.selectedVideos.filter((v) => getVideoId(v) !== videoId),
        };
      }
      
      // Add if doesn't exist
      return {
        ...prev,
        selectedVideos: [...prev.selectedVideos, video],
      };
    });
  }, []);

  // Task 236: Clear all selections
  const clearSelection = useCallback(() => {
    setState({
      selectedVideos: [],
      searchQuery: '',
      searchType: '',
      totalResults: 0,
    });
    clearStoredSelection();
  }, []);

  // Task 237: Select all visible videos
  const selectAll = useCallback((videos) => {
    setState((prev) => {
      // Merge new videos with existing, avoiding duplicates
      const existingIds = new Set(prev.selectedVideos.map((v) => getVideoId(v)));
      const newVideos = videos.filter((v) => !existingIds.has(getVideoId(v)));
      
      return {
        ...prev,
        selectedVideos: [...prev.selectedVideos, ...newVideos],
      };
    });
  }, []);

  // Task 238: Set search metadata
  const setSearchMetadata = useCallback((query, type, totalResults = 0) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
      searchType: type,
      totalResults: totalResults,
    }));
  }, []);

  // Task 240: Memoized selectors - FIXED to use videoId
  const selectors = useMemo(() => ({
    // Check if a video is selected
    isVideoSelected: (videoIdOrVideo) => {
      const id = typeof videoIdOrVideo === 'string' 
        ? videoIdOrVideo 
        : getVideoId(videoIdOrVideo);
      return state.selectedVideos.some((v) => getVideoId(v) === id);
    },
    
    // Get count of selected videos
    getSelectedCount: () => {
      return state.selectedVideos.length;
    },
    
    // Check if any videos are selected
    hasSelection: () => {
      return state.selectedVideos.length > 0;
    },
    
    // Get selected video IDs
    getSelectedIds: () => {
      return state.selectedVideos.map((v) => getVideoId(v));
    },
    
    // Check if all provided videos are selected
    areAllSelected: (videos) => {
      if (!videos || videos.length === 0) return false;
      return videos.every((v) => 
        state.selectedVideos.some((sv) => getVideoId(sv) === getVideoId(v))
      );
    },
  }), [state.selectedVideos]);

  // Task 240: Memoized context value
  const value = useMemo(() => ({
    // State (Task 232)
    selectedVideos: state.selectedVideos,
    searchQuery: state.searchQuery,
    searchType: state.searchType,
    totalResults: state.totalResults,
    
    // Actions (Tasks 233-238)
    addVideo,
    removeVideo,
    toggleVideo,
    clearSelection,
    selectAll,
    setSearchMetadata,
    
    // Selectors (Task 240)
    ...selectors,
  }), [
    state,
    addVideo,
    removeVideo,
    toggleVideo,
    clearSelection,
    selectAll,
    setSearchMetadata,
    selectors,
  ]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

/**
 * Task 240: useSelection hook
 * Returns context with memoized selectors
 * 
 * @returns {Object} Selection context
 * @throws {Error} If used outside SelectionProvider
 * 
 * @example
 * const { selectedVideos, addVideo, isVideoSelected } = useSelection();
 */
export const useSelection = () => {
  const context = useContext(SelectionContext);
  
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  
  return context;
};

export default SelectionContext;