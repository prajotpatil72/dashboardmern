/**
 * ThumbnailAnalysisModal Component
 * Shows top thumbnails with metrics and slider control
 * OPTIMIZED: Exactly 6 videos per scroll
 * Update: "Watch on YouTube" appears only after 4s hover
 */
import React, { useState, useMemo, useRef } from 'react';
import { X, Eye, ThumbsUp, MessageCircle, TrendingUp } from 'lucide-react';

const ThumbnailAnalysisModal = ({ videos, isOpen, onClose }) => {
  const [topCount, setTopCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate engagement rate helper
  const calculateEngagement = (video) => {
    if (video.engagementRate) return parseFloat(video.engagementRate);

    const views = parseInt(video.viewCount || 0);
    const likes = parseInt(video.likeCount || 0);
    const comments = parseInt(video.commentCount || 0);

    if (views === 0) return 0;
    return parseFloat(((likes + comments) / views * 100).toFixed(2));
  };

  // Get top N videos by views with search filter
  const topVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    let filteredVideos = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredVideos = filteredVideos.filter(video =>
        video.title?.toLowerCase().includes(query) ||
        video.channelTitle?.toLowerCase().includes(query)
      );
    }

    return filteredVideos
      .sort((a, b) => parseInt(b.viewCount || 0) - parseInt(a.viewCount || 0))
      .slice(0, topCount)
      .map(video => ({
        ...video,
        engagement: calculateEngagement(video),
      }));
  }, [videos, topCount, searchQuery]);

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get thumbnail URL
  const getThumbnailUrl = (video) => {
    if (video.thumbnails) {
      return video.thumbnails.maxres ||
        video.thumbnails.high ||
        video.thumbnails.medium ||
        video.thumbnails.default ||
        'https://via.placeholder.com/320x180?text=No+Thumbnail';
    }

    return video.snippet?.thumbnails?.high?.url ||
      video.snippet?.thumbnails?.medium?.url ||
      video.snippet?.thumbnails?.default?.url ||
      'https://via.placeholder.com/320x180?text=No+Thumbnail';
  };

  if (!isOpen) return null;

  // ----- Per-card component to handle 4s hover reveal -----
  const ThumbnailItem = ({ video, index }) => {
    const [showWatch, setShowWatch] = useState(false);
    const timerRef = useRef(null);

    const startTimer = () => {
      // start a 4s timer
      timerRef.current = setTimeout(() => setShowWatch(true), 4000);
    };
    const clearTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setShowWatch(false);
    };

    return (
      <div
        onMouseEnter={startTimer}
        onMouseLeave={clearTimer}
        onFocus={startTimer}
        onBlur={clearTimer}
        tabIndex={0} // accessible focus
        className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all flex gap-4 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Rank & Thumbnail */}
        <div className="relative flex-shrink-0" style={{ width: '220px' }}>
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2.5 py-1 rounded-md text-sm font-bold z-10 shadow-lg">
            #{index + 1}
          </div>

          <img
            src={getThumbnailUrl(video)}
            alt={video.title || 'Video thumbnail'}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/220x130?text=No+Thumbnail';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.title || 'Untitled Video'}
          </h3>

          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md px-2 py-1">
              <Eye size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {formatNumber(parseInt(video.viewCount || 0))}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 rounded-md px-2 py-1">
              <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {video.engagement.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md px-2 py-1">
              <ThumbsUp size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {formatNumber(parseInt(video.likeCount || 0))}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-md px-2 py-1">
              <MessageCircle size={14} className="text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {formatNumber(parseInt(video.commentCount || 0))}
              </span>
            </div>
          </div>

          {/* Watch Button — only after 4s hover */}
          {showWatch && (
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Watch on YouTube
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-l-2xl shadow-2xl w-1/2 h-full flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thumbnail Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top performing video thumbnails by view count
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Show: {topCount} videos
            </label>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setTopCount(num)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                    topCount === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={topCount}
            onChange={(e) => setTopCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* List (your layout tuned for 6 per scroll visually) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {topVideos.map((video, index) => (
              <ThumbnailItem
                key={video.videoId || index}
                video={video}
                index={index}
              />
            ))}
          </div>

          {topVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Eye size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-semibold">No videos available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{topVideos.length}</strong> of <strong>{videos.length}</strong> videos
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ThumbnailAnalysisModal;
