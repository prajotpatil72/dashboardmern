/**
 * YouTube Data Parsing Utilities (Tasks 171-180)
 * Functions to transform and parse YouTube API responses
 * 
 * @module utils/parseYouTubeData
 * @description Comprehensive utilities for parsing YouTube API v3 responses
 */

/**
 * Task 174: Category Mapping Object
 * Maps YouTube category IDs to human-readable category names
 * 
 * @constant {Object.<string, string>}
 * @source https://developers.google.com/youtube/v3/docs/videoCategories/list
 */
const CATEGORY_MAPPING = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
  '30': 'Movies',
  '31': 'Anime/Animation',
  '32': 'Action/Adventure',
  '33': 'Classics',
  '34': 'Documentary',
  '35': 'Drama',
  '36': 'Family',
  '37': 'Foreign',
  '38': 'Horror',
  '39': 'Sci-Fi/Fantasy',
  '40': 'Thriller',
  '41': 'Shorts',
  '42': 'Shows',
  '43': 'Trailers',
  '44': 'Live'
};

/**
 * Task 172: Parse ISO 8601 Duration
 * Converts YouTube's ISO 8601 duration format to seconds
 * 
 * @param {string} duration - ISO 8601 duration string (e.g., "PT10M33S")
 * @returns {number} Duration in seconds
 * 
 * @example
 * parseISO8601Duration('PT10M33S')  // Returns 633
 * parseISO8601Duration('PT1H2M10S') // Returns 3730
 * parseISO8601Duration('PT45S')     // Returns 45
 * parseISO8601Duration('PT2H')      // Returns 7200
 */
const parseISO8601Duration = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  // Remove 'PT' prefix
  const timeString = duration.replace('PT', '');
  
  let seconds = 0;
  
  // Extract hours (H)
  const hoursMatch = timeString.match(/(\d+)H/);
  if (hoursMatch) {
    seconds += parseInt(hoursMatch[1], 10) * 3600;
  }
  
  // Extract minutes (M)
  const minutesMatch = timeString.match(/(\d+)M/);
  if (minutesMatch) {
    seconds += parseInt(minutesMatch[1], 10) * 60;
  }
  
  // Extract seconds (S)
  const secondsMatch = timeString.match(/(\d+)S/);
  if (secondsMatch) {
    seconds += parseInt(secondsMatch[1], 10);
  }
  
  return seconds;
};

/**
 * Task 172: Format Duration to Human-Readable String
 * Converts seconds to HH:MM:SS or MM:SS format
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 * 
 * @example
 * formatDuration(633)   // Returns "10:33"
 * formatDuration(3730)  // Returns "1:02:10"
 * formatDuration(45)    // Returns "0:45"
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

/**
 * Task 173: Extract Published Date Features
 * Extracts useful temporal features from video publish date for analysis
 * 
 * @param {string|Date} publishedAt - ISO 8601 date string or Date object
 * @returns {Object} Object containing extracted date features
 * @returns {number} return.dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @returns {string} return.dayOfWeekName - Name of the day
 * @returns {number} return.hour - Hour of day (0-23)
 * @returns {number} return.ageInDays - Days since publication
 * @returns {number} return.ageInHours - Hours since publication
 * @returns {string} return.date - ISO 8601 formatted date string
 * @returns {number} return.year - Year (YYYY)
 * @returns {number} return.month - Month (1-12)
 * @returns {number} return.day - Day of month (1-31)
 * @returns {boolean} return.isWeekend - Whether published on weekend
 * @returns {number} return.timestamp - Unix timestamp (milliseconds)
 * 
 * @example
 * extractPublishedDateFeatures('2024-01-15T14:30:00Z')
 * // Returns: {
 * //   dayOfWeek: 1,
 * //   dayOfWeekName: 'Monday',
 * //   hour: 14,
 * //   ageInDays: 280,
 * //   isWeekend: false,
 * //   ...
 * // }
 */
const extractPublishedDateFeatures = (publishedAt) => {
  if (!publishedAt) {
    return {
      dayOfWeek: null,
      dayOfWeekName: null,
      hour: null,
      ageInDays: null,
      ageInHours: null,
      date: null,
      year: null,
      month: null,
      day: null,
      isWeekend: null
    };
  }

  const date = new Date(publishedAt);
  const now = new Date();

  // Calculate age
  const ageInMilliseconds = now - date;
  const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
  const ageInHours = Math.floor(ageInMilliseconds / (1000 * 60 * 60));

  // Day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekName = dayNames[dayOfWeek];

  // Hour of day (0-23)
  const hour = date.getHours();

  // Check if weekend
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    dayOfWeek,
    dayOfWeekName,
    hour,
    ageInDays,
    ageInHours,
    date: date.toISOString(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    isWeekend,
    timestamp: date.getTime()
  };
};

/**
 * Task 174: Get Category Name from ID
 * Maps YouTube category ID to human-readable name
 * 
 * @param {string|number} categoryId - YouTube category ID
 * @returns {string} Category name or "Unknown" if not found
 * 
 * @example
 * getCategoryName('10')  // Returns "Music"
 * getCategoryName('28')  // Returns "Science & Technology"
 * getCategoryName('999') // Returns "Unknown"
 */
const getCategoryName = (categoryId) => {
  return CATEGORY_MAPPING[String(categoryId)] || 'Unknown';
};

/**
 * Task 176: Format View Count with Abbreviations
 * Formats large numbers with K, M, B suffixes
 * 
 * @param {string|number} viewCount - View count to format
 * @returns {string} Formatted view count
 * 
 * @example
 * formatViewCount(1234567)   // Returns "1.2M"
 * formatViewCount(12345)     // Returns "12.3K"
 * formatViewCount(123)       // Returns "123"
 * formatViewCount(null)      // Returns "0"
 */
const formatViewCount = (viewCount) => {
  const num = parseInt(viewCount, 10);
  
  if (isNaN(num)) {
    return '0';
  }

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Task 171: Parse Complete Video Data
 * Parses and enriches YouTube API video response with calculated metrics
 * 
 * @param {Object} videoItem - YouTube API video item
 * @param {string|Object} videoItem.id - Video ID (string or object with videoId)
 * @param {Object} videoItem.snippet - Video snippet data
 * @param {Object} videoItem.contentDetails - Video content details
 * @param {Object} videoItem.statistics - Video statistics
 * @param {Object} videoItem.status - Video status
 * @returns {Object|null} Parsed and enriched video object, or null if invalid
 * 
 * @example
 * const video = parseVideoData({
 *   id: 'dQw4w9WgXcQ',
 *   snippet: { title: 'Test Video', ... },
 *   contentDetails: { duration: 'PT10M30S', ... },
 *   statistics: { viewCount: '1000000', ... }
 * });
 */
const parseVideoData = (videoItem) => {
  if (!videoItem) {
    return null;
  }

  const { id, snippet, contentDetails, statistics, status } = videoItem;

  // Parse duration
  const durationSeconds = contentDetails?.duration 
    ? parseISO8601Duration(contentDetails.duration)
    : 0;

  // Extract published date features
  const publishedFeatures = snippet?.publishedAt
    ? extractPublishedDateFeatures(snippet.publishedAt)
    : {};

  // Get category name
  const categoryName = snippet?.categoryId
    ? getCategoryName(snippet.categoryId)
    : 'Unknown';

  return {
    // Basic info
    videoId: typeof id === 'string' ? id : id?.videoId || null,
    title: snippet?.title || 'Untitled',
    description: snippet?.description || '',
    
    // Channel info
    channelId: snippet?.channelId || null,
    channelTitle: snippet?.channelTitle || 'Unknown Channel',
    
    // Category
    categoryId: snippet?.categoryId || null,
    categoryName,
    
    // Timestamps
    publishedAt: snippet?.publishedAt || null,
    publishedFeatures,
    
    // Duration
    duration: contentDetails?.duration || null,
    durationSeconds,
    durationFormatted: formatDuration(durationSeconds),
    
    // Thumbnails
    thumbnails: {
      default: snippet?.thumbnails?.default?.url || null,
      medium: snippet?.thumbnails?.medium?.url || null,
      high: snippet?.thumbnails?.high?.url || null,
      standard: snippet?.thumbnails?.standard?.url || null,
      maxres: snippet?.thumbnails?.maxres?.url || null
    },
    
    // Statistics
    viewCount: parseInt(statistics?.viewCount || 0, 10),
    viewCountFormatted: formatViewCount(statistics?.viewCount || 0),
    likeCount: parseInt(statistics?.likeCount || 0, 10),
    commentCount: parseInt(statistics?.commentCount || 0, 10),
    
    // Task 175: Engagement metrics (calculated)
    engagementRate: statistics?.viewCount && statistics?.likeCount
      ? ((parseInt(statistics.likeCount, 10) / parseInt(statistics.viewCount, 10)) * 100).toFixed(2)
      : 0,
    
    // Content details
    definition: contentDetails?.definition || 'sd',
    dimension: contentDetails?.dimension || '2d',
    caption: contentDetails?.caption === 'true',
    licensedContent: contentDetails?.licensedContent || false,
    
    // Tags
    tags: snippet?.tags || [],
    
    // Status
    uploadStatus: status?.uploadStatus || null,
    privacyStatus: status?.privacyStatus || 'public',
    embeddable: status?.embeddable !== false,
    
    // Default language
    defaultLanguage: snippet?.defaultLanguage || null,
    defaultAudioLanguage: snippet?.defaultAudioLanguage || null
  };
};

/**
 * Task 171: Parse Search Results
 * Extracts basic information from YouTube search API response
 * 
 * @param {Object} searchResponse - YouTube search API response
 * @param {Array} searchResponse.data.items - Array of search result items
 * @returns {Array<Object>} Array of parsed search result objects
 * 
 * @example
 * const results = parseSearchResults(searchResponse);
 * // Returns: [{ videoId: '...', title: '...', ... }, ...]
 */
const parseSearchResults = (searchResponse) => {
  if (!searchResponse?.data?.items) {
    return [];
  }

  return searchResponse.data.items.map(item => ({
    videoId: item.id?.videoId || null,
    channelId: item.id?.channelId || null,
    playlistId: item.id?.playlistId || null,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    publishedAt: item.snippet?.publishedAt || null,
    channelTitle: item.snippet?.channelTitle || '',
    thumbnails: item.snippet?.thumbnails || {}
  }));
};

/**
 * Task 177: Parse Channel Data
 * Parses YouTube API channel response with statistics
 * 
 * @param {Object} channelItem - YouTube API channel item
 * @param {string} channelItem.id - Channel ID
 * @param {Object} channelItem.snippet - Channel snippet data
 * @param {Object} channelItem.contentDetails - Channel content details
 * @param {Object} channelItem.statistics - Channel statistics
 * @param {Object} channelItem.brandingSettings - Channel branding settings
 * @returns {Object|null} Parsed channel object, or null if invalid
 * 
 * @example
 * const channel = parseChannelData({
 *   id: 'UCtest123',
 *   snippet: { title: 'Test Channel', ... },
 *   statistics: { subscriberCount: '1000000', ... }
 * });
 */
const parseChannelData = (channelItem) => {
  if (!channelItem) {
    return null;
  }

  const { id, snippet, contentDetails, statistics, brandingSettings } = channelItem;

  return {
    channelId: id,
    title: snippet?.title || 'Unknown Channel',
    description: snippet?.description || '',
    customUrl: snippet?.customUrl || null,
    publishedAt: snippet?.publishedAt || null,
    
    // Thumbnails
    thumbnails: {
      default: snippet?.thumbnails?.default?.url || null,
      medium: snippet?.thumbnails?.medium?.url || null,
      high: snippet?.thumbnails?.high?.url || null
    },
    
    // Task 178: Statistics (parsed as integers)
    subscriberCount: parseInt(statistics?.subscriberCount || 0, 10),
    subscriberCountFormatted: formatViewCount(statistics?.subscriberCount || 0),
    videoCount: parseInt(statistics?.videoCount || 0, 10),
    viewCount: parseInt(statistics?.viewCount || 0, 10),
    viewCountFormatted: formatViewCount(statistics?.viewCount || 0),
    hiddenSubscriberCount: statistics?.hiddenSubscriberCount || false,
    
    // Content
    uploadsPlaylistId: contentDetails?.relatedPlaylists?.uploads || null,
    
    // Branding
    keywords: brandingSettings?.channel?.keywords || '',
    country: snippet?.country || null
  };
};

/**
 * Task 175: Calculate Engagement Score
 * Computes weighted engagement score for ranking videos
 * Formula: (likes + comments*2) / views * 1000
 * 
 * @param {Object} statistics - Video statistics object
 * @param {string|number} statistics.viewCount - Number of views
 * @param {string|number} statistics.likeCount - Number of likes
 * @param {string|number} statistics.commentCount - Number of comments
 * @returns {number} Engagement score (0 if no data)
 * 
 * @example
 * calculateEngagementScore({
 *   viewCount: '1000',
 *   likeCount: '50',
 *   commentCount: '10'
 * }); // Returns 70
 */
const calculateEngagementScore = (statistics) => {
  if (!statistics) {
    return 0;
  }

  const views = parseInt(statistics.viewCount || 0, 10);
  const likes = parseInt(statistics.likeCount || 0, 10);
  const comments = parseInt(statistics.commentCount || 0, 10);

  if (views === 0) {
    return 0;
  }

  return ((likes + comments * 2) / views) * 1000;
};

/**
 * Task 178: Validate Video ID Format
 * Checks if a string is a valid YouTube video ID
 * YouTube video IDs are exactly 11 characters: alphanumeric, hyphen, underscore
 * 
 * @param {string} videoId - Video ID to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * isValidVideoId('dQw4w9WgXcQ')  // Returns true
 * isValidVideoId('invalid')      // Returns false
 * isValidVideoId(null)           // Returns false
 */
const isValidVideoId = (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return videoIdRegex.test(videoId);
};

/**
 * Task 178: Extract Video ID from YouTube URL
 * Extracts video ID from various YouTube URL formats
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID if found, null otherwise
 * 
 * @example
 * extractVideoIdFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns 'dQw4w9WgXcQ'
 * 
 * extractVideoIdFromUrl('https://youtu.be/dQw4w9WgXcQ')
 * // Returns 'dQw4w9WgXcQ'
 * 
 * extractVideoIdFromUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
 * // Returns 'dQw4w9WgXcQ'
 */
const extractVideoIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Regular YouTube URLs
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) {
    return match[1];
  }

  // Short URLs (youtu.be)
  match = url.match(/youtu\.be\/([^?]+)/);
  if (match) {
    return match[1];
  }

  // Embed URLs
  match = url.match(/embed\/([^?]+)/);
  if (match) {
    return match[1];
  }

  return null;
};

/**
 * Task 180: Module Exports with Complete JSDoc
 * All parsing utilities and constants
 */
module.exports = {
  // Constants
  CATEGORY_MAPPING,
  
  // Task 172: Duration parsing
  parseISO8601Duration,
  formatDuration,
  
  // Task 173: Date features
  extractPublishedDateFeatures,
  
  // Task 174: Category mapping
  getCategoryName,
  
  // Task 176: Formatting utilities
  formatViewCount,
  
  // Task 171: Parsing functions
  parseVideoData,
  parseSearchResults,
  parseChannelData,
  
  // Task 175: Calculation utilities
  calculateEngagementScore,
  
  // Task 178: Validation utilities
  isValidVideoId,
  extractVideoIdFromUrl
};


