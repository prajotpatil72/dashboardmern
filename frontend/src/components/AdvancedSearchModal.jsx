/**
 * AdvancedSearchModal.jsx
 * 
 * Advanced search filters modal component inspired by Python script functionality
 * Features:
 * - Minimum view count filter
 * - Minimum like count filter
 * - Minimum comment count filter
 * - Published after date filter
 * - Video category filter
 * - Video duration filter
 * - Max results slider
 */

import { useState, useEffect } from 'react';
import { 
  X, 
  Filter, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Hash,
  RotateCcw,
  Search
} from 'lucide-react';

// YouTube video categories
const VIDEO_CATEGORIES = [
  { id: '', name: 'All Categories' },
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
  { id: '29', name: 'Nonprofits & Activism' },
];

// Duration options
const DURATION_OPTIONS = [
  { value: 'any', label: 'Any Duration' },
  { value: 'short', label: 'Short (< 4 minutes)' },
  { value: 'medium', label: 'Medium (4-20 minutes)' },
  { value: 'long', label: 'Long (> 20 minutes)' },
];

const AdvancedSearchModal = ({ isOpen, onClose, onApplyFilters, initialFilters = {} }) => {
  // Default filter state
  const defaultFilters = {
    minViews: 0,
    minLikes: 0,
    minComments: 0,
    publishedAfter: '',
    category: '',
    duration: 'any',
    maxResults: 50,
  };

  const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });
  const [hasChanges, setHasChanges] = useState(false);

  // Update filters when initialFilters change
  useEffect(() => {
    setFilters({ ...defaultFilters, ...initialFilters });
  }, [initialFilters]);

  // Track changes
  useEffect(() => {
    const changed = Object.keys(filters).some(
      key => filters[key] !== defaultFilters[key]
    );
    setHasChanges(changed);
  }, [filters]);

  if (!isOpen) return null;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate how many filters are active
  const activeFiltersCount = Object.keys(filters).filter(key => {
    if (key === 'maxResults') return false;
    const value = filters[key];
    const defaultValue = defaultFilters[key];
    return value !== defaultValue && value !== '' && value !== 0;
  }).length;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Filter className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Advanced Search Filters
              </h2>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          
          {/* Minimum Views */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Eye size={18} className="text-blue-600 dark:text-blue-400" />
              Minimum View Count
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.minViews}
                onChange={(e) => handleFilterChange('minViews', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filters.minViews.toLocaleString()} views
              </div>
            </div>
            <div className="flex gap-2">
              {[1000, 10000, 100000, 1000000].map(value => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('minViews', value)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  {value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Likes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <ThumbsUp size={18} className="text-green-600 dark:text-green-400" />
              Minimum Like Count
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="100"
                value={filters.minLikes}
                onChange={(e) => handleFilterChange('minLikes', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filters.minLikes.toLocaleString()} likes
              </div>
            </div>
            <div className="flex gap-2">
              {[100, 1000, 10000, 50000].map(value => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('minLikes', value)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  {value >= 1000 ? `${value / 1000}K` : value}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Comments */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <MessageCircle size={18} className="text-purple-600 dark:text-purple-400" />
              Minimum Comment Count
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="10"
                value={filters.minComments}
                onChange={(e) => handleFilterChange('minComments', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filters.minComments.toLocaleString()} comments
              </div>
            </div>
            <div className="flex gap-2">
              {[10, 100, 500, 1000].map(value => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('minComments', value)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  {value >= 1000 ? `${value / 1000}K` : value}
                </button>
              ))}
            </div>
          </div>

          {/* Published After Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={18} className="text-orange-600 dark:text-orange-400" />
              Published After
            </label>
            <input
              type="date"
              value={filters.publishedAfter}
              onChange={(e) => handleFilterChange('publishedAfter', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
            />
            <div className="flex gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'This Week', days: 7 },
                { label: 'This Month', days: 30 },
                { label: 'This Year', days: 365 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    handleFilterChange('publishedAfter', date.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Video Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Hash size={18} className="text-red-600 dark:text-red-400" />
              Video Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
            >
              {VIDEO_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Video Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
              Video Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('duration', option.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    filters.duration === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Results */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <Search size={18} className="text-teal-600 dark:text-teal-400" />
                Maximum Results
              </span>
              <span className="text-blue-600 dark:text-blue-400">{filters.maxResults}</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={filters.maxResults}
              onChange={(e) => handleFilterChange('maxResults', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>10</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={18} />
            Reset All
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              <Filter size={18} />
              Apply Filters
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvancedSearchModal;