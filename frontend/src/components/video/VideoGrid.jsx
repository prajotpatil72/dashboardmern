/**
 * VideoGrid Component - FIXED for flat API structure
 * Works with your backend's flat response (no snippet/statistics nesting)
 */
import { useState } from 'react';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, onVideoClick, selectedVideos, onToggleVideo }) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Calculate engagement rate - FIXED for flat structure
  const calculateEngagement = (video) => {
    // Try flat structure first (your API)
    if (video.engagementRate) return parseFloat(video.engagementRate);
    
    const views = parseInt(video.viewCount || video.statistics?.viewCount || 0);
    const likes = parseInt(video.likeCount || video.statistics?.likeCount || 0);
    const comments = parseInt(video.commentCount || video.statistics?.commentCount || 0);
    
    if (views === 0) return 0;
    return ((likes + comments) / views * 100);
  };

  // Sort videos based on selected criteria - FIXED for flat structure
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        const viewsA = parseInt(a.viewCount || a.statistics?.viewCount || 0);
        const viewsB = parseInt(b.viewCount || b.statistics?.viewCount || 0);
        return viewsB - viewsA;
      
      case 'likes':
        const likesA = parseInt(a.likeCount || a.statistics?.likeCount || 0);
        const likesB = parseInt(b.likeCount || b.statistics?.likeCount || 0);
        return likesB - likesA;
      
      case 'engagement':
        const engA = calculateEngagement(a);
        const engB = calculateEngagement(b);
        return engB - engA;
      
      case 'newest':
        const dateA = new Date(a.publishedAt || a.snippet?.publishedAt);
        const dateB = new Date(b.publishedAt || b.snippet?.publishedAt);
        return dateB - dateA;
      
      case 'oldest':
        const dateC = new Date(a.publishedAt || a.snippet?.publishedAt);
        const dateD = new Date(b.publishedAt || b.snippet?.publishedAt);
        return dateC - dateD;
      
      case 'relevance':
      default:
        return 0;
    }
  });

  // Get video ID helper - FIXED for flat structure
  const getVideoId = (video) => {
    return video.videoId || video.id?.videoId || video.id;
  };

  // Check if video is selected - FIXED for flat structure
  const checkIsSelected = (video) => {
    const videoId = getVideoId(video);
    return selectedVideos.some(v => {
      const selectedId = getVideoId(v);
      return selectedId === videoId;
    });
  };

  // Handle video selection with shift-click support
  const handleVideoSelect = (video, index) => {
    const event = window.event;
    
    if (event?.shiftKey && lastSelectedIndex !== null && lastSelectedIndex !== index) {
      // Range selection
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      for (let i = start; i <= end; i++) {
        const videoToSelect = sortedVideos[i];
        
        // Only select if not already selected
        if (!checkIsSelected(videoToSelect)) {
          if (onToggleVideo) {
            onToggleVideo(videoToSelect);
          } else if (onVideoClick) {
            onVideoClick(videoToSelect);
          }
        }
      }
    } else {
      // Single selection toggle
      if (onToggleVideo) {
        onToggleVideo(video);
      } else if (onVideoClick) {
        onVideoClick(video);
      }
    }
    
    setLastSelectedIndex(index);
  };

  // Select all videos in current view
  const handleSelectAll = () => {
    sortedVideos.forEach(video => {
      if (!checkIsSelected(video)) {
        if (onToggleVideo) {
          onToggleVideo(video);
        } else if (onVideoClick) {
          onVideoClick(video);
        }
      }
    });
  };

  // Deselect all videos in current view
  const handleDeselectAll = () => {
    sortedVideos.forEach(video => {
      if (checkIsSelected(video)) {
        if (onToggleVideo) {
          onToggleVideo(video);
        } else if (onVideoClick) {
          onVideoClick(video);
        }
      }
    });
  };

  // Count selected videos in current view
  const selectedInView = sortedVideos.filter(video => checkIsSelected(video)).length;
  const allSelected = selectedInView === sortedVideos.length && sortedVideos.length > 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Select All Button */}
          <button
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            <input
              type="checkbox"
              checked={allSelected}
              readOnly
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>

          {/* Selected Count Badge */}
          {selectedInView > 0 && (
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {selectedInView} selected in this view
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
            <option value="engagement">Highest Engagement</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedVideos.map((video, index) => (
            <VideoCard
              key={getVideoId(video)}
              video={video}
              isSelected={checkIsSelected(video)}
              onSelect={() => handleVideoSelect(video, index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No videos to display</p>
        </div>
      )}

      {/* Shift-Click Hint */}
      {sortedVideos.length > 1 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Tip:</strong> Hold{' '}
              <kbd className="px-2 py-1 mx-1 bg-blue-200 dark:bg-blue-800 rounded text-xs font-semibold">
                Shift
              </kbd>{' '}
              and click to select a range of videos
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;