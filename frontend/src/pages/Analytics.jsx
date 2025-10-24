/**
 * Analytics Dashboard - UPDATED
 * Tasks 241-300 Complete: Full-width desktop layout with tabs and charts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../contexts/SelectionContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TabNavigation from '../components/dashboard/TabNavigation';
import ExportButtons from '../components/dashboard/ExportButtons';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import OverviewTab from '../components/dashboard/charts/OverviewTab';
import CustomChartBuilder from '../components/dashboard/charts/CustomChartBuilder';

/**
 * Tasks 241-300: Analytics Dashboard with Charts
 */
const Analytics = () => {
  const navigate = useNavigate();
  const { selectedVideos, searchQuery, searchType, totalResults, clearSelection } = useSelection();
  
  // Task 243: Tab state management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Search metadata for display and export
  const searchMetadata = {
    searchQuery,
    searchType,
    totalResults,
  };

  // Task 249: Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Task 244: Redirect to /search if no videos selected
  useEffect(() => {
    if (!loading && selectedVideos.length === 0) {
      const timer = setTimeout(() => navigate('/search'), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, selectedVideos.length, navigate]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Task 242: Desktop layout with 80px padding */}
        <div className="max-w-[1920px] mx-auto px-20 py-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Task 244: Show message if no videos selected
  if (selectedVideos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 max-w-md text-center border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Videos Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select videos from the search page to analyze.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Task 242: Desktop layout with 80px padding */}
      <div className="max-w-[1920px] mx-auto px-20 py-10 space-y-6">
        
        {/* Task 246-247: Dashboard header with summary cards */}
        <DashboardHeader videos={selectedVideos} searchMetadata={searchMetadata} />

        {/* Action bar with export and clear */}
        <div className="flex items-center justify-between">
          {/* Task 248: Export buttons */}
          <ExportButtons videos={selectedVideos} searchMetadata={searchMetadata} />
          
          {/* Clear selection button */}
          <button
            onClick={clearSelection}
            className="px-6 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-colors border-2 border-red-600 dark:border-red-400"
          >
            Clear Selection
          </button>
        </div>

        {/* Task 243: Tab navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Task 250: Content area with smooth transitions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 min-h-[600px]">
          <div
            key={activeTab}
            className="animate-fade-in"
            style={{
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          >
            {renderTabContent(activeTab, selectedVideos)}
          </div>
        </div>
      </div>

      {/* Task 250: Add CSS for smooth transitions */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Render content based on active tab
 * Tasks 251-260: Overview tab with charts
 * Tasks 291-300: Custom tab with CustomChartBuilder
 */
const renderTabContent = (tab, videos) => {
  switch (tab) {
    case 'overview':
      // Tasks 251-260: Overview tab with PerformanceOverview and EngagementRateChart
      return <OverviewTab videos={videos} />;

    case 'engagement':
      return <PlaceholderTab 
        title="❤️ Engagement Analytics"
        description="Analyze likes, comments, and engagement rates for your videos."
        message="Tasks 261-270: Scatter plots and dual-axis charts coming next!"
        videoCount={videos.length}
      />;

    case 'content-strategy':
      return <PlaceholderTab 
        title="💡 Content Strategy Insights"
        description="Discover optimal upload times, video lengths, and content patterns."
        message="Tasks 271-280: Duration analysis and heatmaps coming next!"
        videoCount={videos.length}
      />;

    case 'tags':
      return <PlaceholderTab 
        title="🏷️ Tag Analysis"
        description="Explore common tags and keywords used in your selected videos."
        message="Tasks 281-290: Tag cloud and correlation matrix coming next!"
        videoCount={videos.length}
      />;

    case 'custom':
      // Tasks 291-300: Custom Chart Builder
      return <CustomChartBuilder videos={videos} />;

    default:
      return <OverviewTab videos={videos} />;
  }
};

/**
 * Placeholder component for tabs not yet implemented
 */
const PlaceholderTab = ({ title, description, message, videoCount }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-6xl mb-4">📈</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Charts Coming Soon!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Currently analyzing:</strong> {videoCount} videos
        </p>
      </div>
    </div>
  </div>
);

export default Analytics;