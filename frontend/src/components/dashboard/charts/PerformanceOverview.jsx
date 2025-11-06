/**
 * PerformanceOverview Chart - UPDATED
 * Tasks 251-254: Large Bar Chart (1000px × 500px) showing views by video
 * Colors bars by engagement rate (gradient red → green)
 * NEW: Added Thumbnail Analysis button
 */
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ImageIcon } from 'lucide-react';
import ThumbnailAnalysisModal from '../ThumbnailAnalysisModal';

const PerformanceOverview = ({ videos }) => {
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);

  // Helper to calculate engagement rate
  const calculateEngagement = (video) => {
    // If already provided, use it
    if (video.engagementRate) return parseFloat(video.engagementRate);
    
    // Calculate from raw stats
    const views = parseInt(video.viewCount || 0);
    const likes = parseInt(video.likeCount || 0);
    const comments = parseInt(video.commentCount || 0);
    
    if (views === 0) return 0;
    return parseFloat(((likes + comments) / views * 100).toFixed(2));
  };

  // Task 253: Prepare data - top 20 videos by views
  const chartData = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    console.log('[PerformanceOverview] Processing videos:', videos.length);
    console.log('[PerformanceOverview] First video:', videos[0]);

    // Sort by views and take top 20
    const sortedVideos = [...videos]
      .sort((a, b) => parseInt(b.viewCount || 0) - parseInt(a.viewCount || 0))
      .slice(0, 20);

    const data = sortedVideos.map((video, index) => {
      const engagement = calculateEngagement(video);
      
      console.log(`[PerformanceOverview] Video ${index}:`, {
        title: video.title?.substring(0, 30),
        views: video.viewCount,
        engagement: engagement
      });

      return {
        name: video.title?.substring(0, 30) + '...' || `Video ${index + 1}`,
        views: parseInt(video.viewCount || 0),
        engagement: engagement,
        fullTitle: video.title,
      };
    });

    console.log('[PerformanceOverview] Chart data:', data);
    return data;
  }, [videos]);

  // Task 253: Color bars by engagement rate (gradient red → green)
  const getBarColor = (engagement) => {
    if (engagement >= 5) return '#10b981'; // Green - High engagement
    if (engagement >= 3) return '#f59e0b'; // Orange - Medium engagement
    return '#ef4444'; // Red - Low engagement
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {data.fullTitle}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Views:</strong> {data.views.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Engagement:</strong> {data.engagement.toFixed(2)}%
        </p>
        <p className="text-sm mt-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            data.engagement >= 5 ? 'bg-green-100 text-green-800' :
            data.engagement >= 3 ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {data.engagement >= 5 ? 'High' : data.engagement >= 3 ? 'Medium' : 'Low'} Engagement
          </span>
        </p>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  console.log('[PerformanceOverview] Rendering chart with data:', chartData);

  return (
    <div className="space-y-4">
      {/* Header with Thumbnail Analysis Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Overview
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Top 20 videos by view count, colored by engagement rate
          </p>
        </div>
        
        {/* Thumbnail Analysis Button */}
        <button
          onClick={() => setShowThumbnailModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
        >
          <ImageIcon size={20} />
          <span>Thumbnail Analysis</span>
        </button>
      </div>

      {/* Task 252: Large Bar Chart (1000px × 500px) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis
              tick={{ fontSize: 14, fill: '#6b7280' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '16px', paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="views" name="Views" radius={[8, 8, 0, 0]}>
              {/* Task 253: Color each bar by engagement rate */}
              {chartData.map((entry, index) => {
                const color = getBarColor(entry.engagement);
                return (
                  <Cell key={`cell-${index}`} fill={color} />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Task 260: Chart legend explaining colors */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High Engagement (≥5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium Engagement (3-5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Low Engagement (&lt;3%)</span>
          </div>
        </div>
      </div>

      {/* Thumbnail Analysis Modal */}
      <ThumbnailAnalysisModal
        videos={videos}
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
      />
    </div>
  );
};

export default PerformanceOverview;