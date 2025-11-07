/**
 * Search Page - WITH ADVANCED SEARCH MODAL
 * Enhanced with comprehensive filtering capabilities
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Search as SearchIcon, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  Video, 
  Users, 
  X, 
  Trash2,
  Filter,
  SlidersHorizontal 
} from 'lucide-react';
import { youtubeAPI } from '../api/youtube';
import { useAuth } from '../contexts/AuthContext';
import { useSelection } from '../contexts/SelectionContext';
import VideoGrid from '../components/video/VideoGrid';
import AdvancedSearchModal from '../components/AdvancedSearchModal';

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Selection Context Integration
  const { 
    selectedVideos, 
    toggleVideo, 
    clearSelection, 
    setSearchMetadata,
    getSelectedCount 
  } = useSelection();
  
  const [searchType, setSearchType] = useState('keyword');
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [trendingCount, setTrendingCount] = useState(20);
  const [validationError, setValidationError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [searchStartTime, setSearchStartTime] = useState(0);
  const [quotaUsed, setQuotaUsed] = useState(0);
  
  // Advanced Search Modal State
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minViews: 0,
    minLikes: 0,
    minComments: 0,
    publishedAfter: '',
    category: '',
    duration: 'any',
    maxResults: 50,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
    
    // Load quota used
    const savedQuota = localStorage.getItem('quotaUsed');
    if (savedQuota) {
      setQuotaUsed(parseInt(savedQuota));
    }
    
    // Load saved advanced filters
    const savedFilters = localStorage.getItem('advancedFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setAdvancedFilters(filters);
        calculateActiveFilters(filters);
      } catch (error) {
        console.error('Failed to load advanced filters:', error);
      }
    }
  }, []);

  // Calculate active filters count
  const calculateActiveFilters = (filters) => {
    const defaultFilters = {
      minViews: 0,
      minLikes: 0,
      minComments: 0,
      publishedAfter: '',
      category: '',
      duration: 'any',
      maxResults: 50,
    };
    
    const count = Object.keys(filters).filter(key => {
      if (key === 'maxResults') return false;
      const value = filters[key];
      const defaultValue = defaultFilters[key];
      return value !== defaultValue && value !== '' && value !== 0;
    }).length;
    
    setActiveFiltersCount(count);
  };

  // Handle applying advanced filters
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
    setMaxResults(filters.maxResults);
    calculateActiveFilters(filters);
    
    // Save to localStorage
    localStorage.setItem('advancedFilters', JSON.stringify(filters));
    
    console.log('✨ Advanced filters applied:', filters);
  };

  // Filter results based on advanced filters
  const applyClientSideFilters = (videos) => {
    return videos.filter(video => {
      // Apply minimum views filter
      if (advancedFilters.minViews > 0 && video.viewCount < advancedFilters.minViews) {
        return false;
      }
      
      // Apply minimum likes filter
      if (advancedFilters.minLikes > 0 && video.likeCount < advancedFilters.minLikes) {
        return false;
      }
      
      // Apply minimum comments filter
      if (advancedFilters.minComments > 0 && video.commentCount < advancedFilters.minComments) {
        return false;
      }
      
      // Apply published after filter
      if (advancedFilters.publishedAfter) {
        const publishedDate = new Date(video.publishedAt);
        const filterDate = new Date(advancedFilters.publishedAfter);
        if (publishedDate < filterDate) {
          return false;
        }
      }
      
      // Apply duration filter
      if (advancedFilters.duration !== 'any' && video.duration) {
        const durationSeconds = video.duration;
        if (advancedFilters.duration === 'short' && durationSeconds >= 240) {
          return false;
        }
        if (advancedFilters.duration === 'medium' && (durationSeconds < 240 || durationSeconds > 1200)) {
          return false;
        }
        if (advancedFilters.duration === 'long' && durationSeconds <= 1200) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Search mutation with ROBUST data extraction
  const searchMutation = useMutation({
    mutationFn: (searchParams) => {
      // Add category to search params if set
      const params = { ...searchParams };
      if (advancedFilters.category && searchType === 'keyword') {
        params.videoCategoryId = advancedFilters.category;
      }
      if (advancedFilters.publishedAfter && searchType === 'keyword') {
        params.publishedAfter = `${advancedFilters.publishedAfter}T00:00:00Z`;
      }
      
      if (searchType === 'keyword') {
        return youtubeAPI.search(params);
      } else if (searchType === 'video') {
        return youtubeAPI.getVideo(params.q);
      } else if (searchType === 'channel') {
        return youtubeAPI.getChannel(params.q);
      } else if (searchType === 'trending') {
        return youtubeAPI.getTrending({ maxResults: params.maxResults });
      }
    },
    onSuccess: (response) => {
      let searchResults = [];
      
      console.log('═══════════════════════════════════════════');
      console.log('🔍 SEARCH RESPONSE DEBUG');
      console.log('═══════════════════════════════════════════');
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.data:', response.data?.data);
      
      const tryExtract = (obj) => {
        return obj?.data?.data?.results ||
               obj?.data?.results ||
               obj?.results ||
               [];
      };
      
      if (searchType === 'keyword') {
        searchResults = tryExtract(response);
        const queryValue = response.data?.data?.query || response.data?.query || query;
        setSearchMetadata(queryValue, 'keyword', searchResults.length);
        
      } else if (searchType === 'video') {
        const video = response.data?.data?.video || response.data?.video;
        searchResults = video ? [video] : [];
        setSearchMetadata(query, 'video', searchResults.length);
        
      } else if (searchType === 'channel') {
        const videos = response.data?.data?.videos || response.data?.videos || [];
        searchResults = videos;
        const channelTitle = response.data?.data?.channel?.channelTitle || 
                           response.data?.channel?.channelTitle || 
                           query;
        setSearchMetadata(channelTitle, 'channel', searchResults.length);
        
      } else if (searchType === 'trending') {
        searchResults = tryExtract(response);
        setSearchMetadata('Trending Videos', 'trending', searchResults.length);
      }
      
      console.log('✅ Raw results count:', searchResults.length);
      
      // Apply client-side filters
      const filteredResults = applyClientSideFilters(searchResults);
      console.log('✅ Filtered results count:', filteredResults.length);
      console.log('🎯 Active filters:', advancedFilters);
      
      setResults(filteredResults);
      
      // Add to search history
      if (query.trim() && searchType !== 'trending') {
        const newHistory = [
          {
            query: query.trim(),
            type: searchType,
            timestamp: new Date().toISOString(),
            resultCount: filteredResults.length,
          },
          ...searchHistory.filter(h => h.query !== query.trim()).slice(0, 9)
        ];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      
      // Update quota
      const newQuota = quotaUsed + 1;
      setQuotaUsed(newQuota);
      localStorage.setItem('quotaUsed', newQuota.toString());
      
      const searchTime = Date.now() - searchStartTime;
      console.log(`⏱️ Search completed in ${searchTime}ms`);
    },
    onError: (error) => {
      console.error('❌ Search Error:', error);
      setValidationError(error.response?.data?.error || 'Search failed. Please try again.');
    },
  });

  // Handle search submission
  const handleSearch = (e) => {
    e?.preventDefault();
    setValidationError('');
    
    if (searchType !== 'trending' && !query.trim()) {
      setValidationError('Please enter a search query');
      return;
    }
    
    if (quotaUsed >= 100) {
      setValidationError('Daily quota limit reached (100 searches). Please try again tomorrow.');
      return;
    }
    
    console.log('🚀 Starting search for:', query);
    setSearchStartTime(Date.now());
    
    const searchParams = searchType === 'trending' 
      ? { maxResults: trendingCount }
      : { q: query.trim(), maxResults: advancedFilters.maxResults };
    
    searchMutation.mutate(searchParams);
  };

  // Handle recent search click
  const handleRecentSearchClick = (historyItem) => {
    setSearchType(historyItem.type);
    setQuery(historyItem.query);
    setValidationError('');
    
    setSearchStartTime(Date.now());
    const searchParams = { q: historyItem.query, maxResults: advancedFilters.maxResults };
    searchMutation.mutate(searchParams);
  };

  // Clear individual search from history
  const clearIndividualSearch = (queryToRemove, e) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h.query !== queryToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Clear all search history
  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Handle view analytics
  const handleViewAnalytics = () => {
    if (getSelectedCount() === 0) {
      setValidationError('Please select at least one video to view analytics');
      return;
    }
    navigate('/analytics');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            YouTube Analytics Search
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Search videos, channels, or explore trending content
          </p>
          
          {/* Quota Display */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Daily Quota: {quotaUsed}/100 searches
              </span>
            </div>
            {getSelectedCount() > 0 && (
              <button
                onClick={handleViewAnalytics}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                View Analytics ({getSelectedCount()} selected)
              </button>
            )}
          </div>
        </div>

        {/* Search Type Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSearchType('keyword')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                searchType === 'keyword'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <SearchIcon size={20} />
              Keyword Search
            </button>
            <button
              onClick={() => setSearchType('video')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                searchType === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Video size={20} />
              Video ID
            </button>
            <button
              onClick={() => setSearchType('channel')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                searchType === 'channel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Users size={20} />
              Channel ID
            </button>
            <button
              onClick={() => setSearchType('trending')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                searchType === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp size={20} />
              Trending
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              {searchType !== 'trending' && (
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchType === 'keyword'
                      ? 'Enter search keywords...'
                      : searchType === 'video'
                      ? 'Enter video ID (e.g., dQw4w9WgXcQ)'
                      : 'Enter channel ID (e.g., UCsBjURrPoezykLs9EqgamOA)'
                  }
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                />
              )}
              
              {searchType === 'trending' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Videos: {trendingCount}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={trendingCount}
                    onChange={(e) => setTrendingCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Advanced Search Button */}
              <button
                type="button"
                onClick={() => setShowAdvancedModal(true)}
                className="relative px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal size={20} />
                Advanced
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={searchMutation.isPending || quotaUsed >= 100}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon size={20} />
                  {searchType === 'trending' ? 'Load Trending Videos' : 'Search'}
                </>
              )}
            </button>
          </form>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <span className="text-red-600 dark:text-red-400">{validationError}</span>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Filter size={18} />
                Active Filters ({activeFiltersCount})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {advancedFilters.minViews > 0 && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  Views ≥ {advancedFilters.minViews.toLocaleString()}
                </span>
              )}
              {advancedFilters.minLikes > 0 && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm">
                  Likes ≥ {advancedFilters.minLikes.toLocaleString()}
                </span>
              )}
              {advancedFilters.minComments > 0 && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                  Comments ≥ {advancedFilters.minComments.toLocaleString()}
                </span>
              )}
              {advancedFilters.publishedAfter && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                  After {new Date(advancedFilters.publishedAfter).toLocaleDateString()}
                </span>
              )}
              {advancedFilters.category && (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm">
                  Category Filter
                </span>
              )}
              {advancedFilters.duration !== 'any' && (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                  Duration: {advancedFilters.duration}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Searches</h2>
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-2 px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(item)}
                  className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">{item.query}</span>
                  <span className="text-xs text-gray-500">({item.resultCount} results)</span>
                  <button
                    onClick={(e) => clearIndividualSearch(item.query, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Results ({results.length})
              </h2>
              {getSelectedCount() > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Clear Selection ({getSelectedCount()})
                </button>
              )}
            </div>
            
            <VideoGrid 
              videos={results}
              selectedVideos={selectedVideos}
              onToggleVideo={toggleVideo}
            />
          </div>
        )}

        {/* Empty State */}
        {!searchMutation.isPending && results.length === 0 && !validationError && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start searching to analyze YouTube videos
            </p>
          </div>
        )}
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        initialFilters={advancedFilters}
      />
    </div>
  );
};

export default Search;