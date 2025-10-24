/**
 * VideoCard Component - FIXED for flat API structure
 * Works with your backend's flat response (no snippet/statistics nesting)
 */
import { useState } from 'react';
import { Eye, ThumbsUp, MessageCircle, Calendar } from 'lucide-react';

const VideoCard = ({ video, isSelected, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  // Format numbers
  const formatNumber = (num) => {
    if (!num) return '0';
    const number = parseInt(num);
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Calculate engagement rate - FIXED for flat structure
  const calculateEngagement = () => {
    // Try flat structure first (your API)
    const views = parseInt(video.viewCount || 0);
    const likes = parseInt(video.likeCount || 0);
    const comments = parseInt(video.commentCount || 0);
    
    if (views === 0) return video.engagementRate || 0;
    
    // If engagementRate is already provided, use it
    if (video.engagementRate) return parseFloat(video.engagementRate);
    
    return ((likes + comments) / views * 100).toFixed(2);
  };

  const engagementRate = calculateEngagement();

  // Determine engagement level
  const getEngagementLevel = () => {
    const rate = parseFloat(engagementRate);
    if (rate >= 5) return { label: 'High Engagement', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-100' };
    if (rate >= 2) return { label: 'Medium Engagement', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { label: 'Low Engagement', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' };
  };

  const engagement = getEngagementLevel();

  // Get thumbnail - FIXED for flat structure
  const getThumbnail = () => {
    if (imageError) {
      return 'https://via.placeholder.com/480x360/1f2937/9ca3af?text=No+Image';
    }
    
    // Try flat structure (your API)
    if (video.thumbnails) {
      return video.thumbnails.maxres || 
             video.thumbnails.high || 
             video.thumbnails.medium || 
             video.thumbnails.default ||
             'https://via.placeholder.com/480x360/1f2937/9ca3af?text=No+Image';
    }
    
    // Fallback to nested structure (if needed)
    return video.snippet?.thumbnails?.high?.url || 
           video.snippet?.thumbnails?.medium?.url || 
           video.snippet?.thumbnails?.default?.url ||
           'https://via.placeholder.com/480x360/1f2937/9ca3af?text=No+Image';
  };

  // Handle card click
  const handleCardClick = (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    onSelect(video);
  };

  // Get video ID - FIXED for flat structure
  const videoId = video.videoId || video.id?.videoId || video.id;

  // Get video data - supports both flat and nested structures
  const getTitle = () => video.title || video.snippet?.title || 'Untitled Video';
  const getChannel = () => video.channelTitle || video.snippet?.channelTitle || 'Unknown Channel';
  const getViews = () => video.viewCount || video.statistics?.viewCount || 0;
  const getLikes = () => video.likeCount || video.statistics?.likeCount || 0;
  const getComments = () => video.commentCount || video.statistics?.commentCount || 0;
  const getPublishedAt = () => video.publishedAt || video.snippet?.publishedAt;

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg 
        transition-all duration-300 cursor-pointer
        hover:shadow-2xl hover:scale-[1.02]
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
      `}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${isSelected 
              ? 'bg-blue-600 border-blue-600' 
              : 'bg-white/90 border-gray-300 group-hover:border-blue-400'
            }
          `}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Engagement Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${engagement.bgColor} ${engagement.textColor}
          shadow-lg
        `}>
          {engagement.label}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={getThumbnail()}
          alt={getTitle()}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {getTitle()}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {getChannel()}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{formatNumber(getViews())}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ThumbsUp className="w-4 h-4" />
            <span>{formatNumber(getLikes())}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(getComments())}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(getPublishedAt())}</span>
          </div>
        </div>

        {/* Engagement bar */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Engagement Rate</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{engagementRate}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${engagement.color} transition-all duration-500`}
              style={{ width: `${Math.min(parseFloat(engagementRate) * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* YouTube Link */}
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Watch on YouTube →
        </a>
      </div>
    </div>
  );
};

export default VideoCard;