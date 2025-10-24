/**
 * DashboardHeader Component
 * Tasks 246-247: Display 4 summary stat cards
 */
import React, { useMemo } from 'react';
import { TrendingUp, Eye, ThumbsUp, Calendar } from 'lucide-react';

const DashboardHeader = ({ videos, searchMetadata }) => {
  // Task 247: Calculate summary statistics
  const stats = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        totalViews: 0,
        avgEngagement: 0,
        mostViewed: null,
        bestDay: 'N/A',
      };
    }

    // Total Views
    const totalViews = videos.reduce((sum, video) => {
      return sum + (parseInt(video.viewCount) || 0);
    }, 0);

    // Average Engagement Rate
    const avgEngagement = videos.reduce((sum, video) => {
      return sum + (parseFloat(video.engagementRate) || 0);
    }, 0) / videos.length;

    // Most Viewed Video
    const mostViewed = videos.reduce((max, video) => {
      const views = parseInt(video.viewCount) || 0;
      const maxViews = parseInt(max.viewCount) || 0;
      return views > maxViews ? video : max;
    }, videos[0]);

    // Best Publishing Day (most common)
    const dayCount = {};
    videos.forEach(video => {
      const day = video.publishedFeatures?.dayOfWeekName || 'Unknown';
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const bestDay = Object.entries(dayCount).reduce((max, [day, count]) => {
      return count > max.count ? { day, count } : max;
    }, { day: 'N/A', count: 0 }).day;

    return {
      totalViews,
      avgEngagement: avgEngagement.toFixed(2),
      mostViewed,
      bestDay,
    };
  }, [videos]);

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Task 245: Search metadata header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-blue-100">
              Analyzing <strong>{videos.length}</strong> videos
              {searchMetadata.searchQuery && ` for "${searchMetadata.searchQuery}"`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Search Type</div>
            <div className="text-2xl font-bold capitalize">
              {searchMetadata.searchType || 'Query'}
            </div>
          </div>
        </div>
      </div>

      {/* Task 246-247: 4 Summary Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.totalViews)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </div>
        </div>

        {/* Average Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ThumbsUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.avgEngagement}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Engagement Rate
          </div>
        </div>

        {/* Most Viewed Video */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.mostViewed ? formatNumber(parseInt(stats.mostViewed.viewCount)) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            Most Viewed: {stats.mostViewed?.title?.substring(0, 30) || 'N/A'}...
          </div>
        </div>

        {/* Best Publishing Day */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Calendar className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.bestDay}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Best Publishing Day
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
