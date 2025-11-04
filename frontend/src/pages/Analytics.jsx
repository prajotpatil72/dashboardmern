/**
 * Analytics Dashboard - UPDATED WITH ENGAGEMENT TAB
 * Tasks 241-270 Complete: Full-width desktop layout with tabs and charts
 * NEW: Tasks 261-270 - Engagement Analytics Tab
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
import EngagementTab from '../components/dashboard/charts/EngagementTab'; // NEW
import CustomChartBuilder from '../components/dashboard/charts/CustomChartBuilder';

/**
 * Tasks 241-270: Analytics Dashboard with Charts
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

  // Task 244: Show empty state instead of redirecting
  // Removed redirect - now shows landing page
  // useEffect(() => {
  //   if (!loading && selectedVideos.length === 0) {
  //     const timer = setTimeout(() => navigate('/search'), 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [loading, selectedVideos.length, navigate]);

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

  // Task 244: Show landing page if no videos selected
  if (selectedVideos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1920px] mx-auto px-20 py-20">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="max-w-2xl mx-auto">
              {/* Icon */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to YouTube Analytics
              </h1>
              
              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Get started by searching for videos and selecting the ones you want to analyze. 
                You'll see powerful insights about engagement, performance, and content strategy.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Overview Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View performance metrics and engagement rates</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Engagement Insights</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyze likes, comments, and correlations</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Download your analysis as CSV or PDF</p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Videos to Get Started
              </button>

              {/* Helper text */}
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
                💡 Tip: Select multiple videos for better insights
              </p>
            </div>
          </div>
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
      <style>{`
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
 * Tasks 261-270: Engagement tab with scatter plot and dual-axis chart (NEW)
 * Tasks 291-300: Custom tab with CustomChartBuilder
 */
const renderTabContent = (tab, videos) => {
  switch (tab) {
    case 'overview':
      // Tasks 251-260: Overview tab with PerformanceOverview and EngagementRateChart
      return <OverviewTab videos={videos} />;

    case 'engagement':
      // Tasks 261-270: Engagement tab with EngagementBreakdown and LikesVsCommentsChart (NEW)
      return <EngagementTab videos={videos} />;

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