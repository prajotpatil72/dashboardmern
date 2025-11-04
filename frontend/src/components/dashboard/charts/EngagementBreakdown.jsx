/**
 * EngagementBreakdown Component
 * Tasks 261-264: Large Scatter Plot (Views vs Engagement)
 * Features:
 * - 1200px × 700px scatter plot
 * - Quadrant lines showing average thresholds
 * - Large tooltip with video thumbnail on hover
 * - Zoom functionality (mouse wheel)
 */
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { ZoomIn, RotateCcw } from 'lucide-react';

/**
 * Helper: Calculate engagement rate
 * Handles both nested (video.statistics.viewCount) and flat (video.viewCount) structures
 */
const calculateEngagementRate = (video) => {
  // Support both structures: video.statistics.viewCount OR video.viewCount
  const views = parseInt(video.statistics?.viewCount || video.viewCount || 0);
  const likes = parseInt(video.statistics?.likeCount || video.likeCount || 0);
  const comments = parseInt(video.statistics?.commentCount || video.commentCount || 0);
  
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
};

/**
 * Helper: Get video ID from various structures
 */
const getVideoId = (video) => {
  return video.videoId || video.id?.videoId || video.id;
};

/**
 * Task 261: EngagementBreakdown Component
 */
const EngagementBreakdown = ({ videos }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Debug: Log videos data structure
  React.useEffect(() => {
    console.log('🎯 EngagementBreakdown received videos:', videos);
    console.log('🎯 Video count:', videos?.length);
    if (videos && videos.length > 0) {
      console.log('🎯 First video structure:', videos[0]);
      console.log('🎯 First video statistics:', videos[0]?.statistics);
    }
  }, [videos]);

  // Task 262: Prepare scatter plot data
  const scatterData = useMemo(() => {
    if (!videos || videos.length === 0) {
      console.warn('⚠️ No videos provided to EngagementBreakdown');
      return [];
    }

    return videos.map(video => {
      // Safe parsing of statistics with fallbacks - supports BOTH structures
      const stats = video.statistics || video; // Fallback to video itself for flat structure
      const views = parseInt(stats.viewCount || 0);
      const likes = parseInt(stats.likeCount || 0);
      const comments = parseInt(stats.commentCount || 0);
      
      // Calculate engagement rate
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
      const videoId = getVideoId(video);
      
      // Debug log for first video
      if (video === videos[0]) {
        console.log('📊 First video processed:', {
          videoId,
          views,
          likes,
          comments,
          engagement: engagement.toFixed(2) + '%',
          hasNestedStats: !!video.statistics,
          rawStats: video.statistics || { viewCount: video.viewCount, likeCount: video.likeCount }
        });
      }
      
      return {
        x: views,
        y: engagement,
        title: video.snippet?.title || video.title || 'Untitled',
        videoId: videoId,
        thumbnail: video.snippet?.thumbnails?.default?.url || video.thumbnails?.default || '',
        likes: likes,
        comments: comments,
      };
    }).filter(item => item.x > 0 || item.y > 0); // Filter out completely empty data
  }, [videos]);

  // Task 263: Calculate average thresholds for quadrant lines
  const averages = useMemo(() => {
    if (scatterData.length === 0) return { avgViews: 0, avgEngagement: 0 };
    
    const avgViews = scatterData.reduce((sum, d) => sum + d.x, 0) / scatterData.length;
    const avgEngagement = scatterData.reduce((sum, d) => sum + d.y, 0) / scatterData.length;
    
    return { avgViews, avgEngagement };
  }, [scatterData]);

  // Task 269: Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 1));
  const handleResetZoom = () => setZoomLevel(1);

  // Task 264: Custom tooltip with large format and thumbnail
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl p-4 max-w-sm">
        {/* Video thumbnail */}
        {data.thumbnail && (
          <img 
            src={data.thumbnail} 
            alt={data.title}
            className="w-full h-24 object-cover rounded mb-3"
          />
        )}
        
        {/* Video title */}
        <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm line-clamp-2">
          {data.title}
        </h4>
        
        {/* Metrics */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Views:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data.x.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {data.y.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Likes:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {data.likes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Comments:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {data.comments.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Color dots based on engagement level
  const getDotColor = (engagement) => {
    if (engagement >= averages.avgEngagement * 1.5) return '#10b981'; // High - Green
    if (engagement >= averages.avgEngagement) return '#3b82f6'; // Above avg - Blue
    if (engagement >= averages.avgEngagement * 0.5) return '#f59e0b'; // Below avg - Orange
    return '#ef4444'; // Low - Red
  };

  // Show message if no data
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
          No videos available for analysis. Please select videos from the search page.
        </p>
      </div>
    );
  }

  // Show message if no valid data after filtering
  if (scatterData.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
          ⚠️ No valid engagement data found
        </p>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
          The selected videos don't have statistics data (views, likes, comments).
        </p>
        <details className="text-left bg-white dark:bg-gray-800 rounded p-4 max-w-md mx-auto">
          <summary className="cursor-pointer font-semibold mb-2">Debug Info</summary>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(videos[0], null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Views vs Engagement Rate
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Scatter plot showing the relationship between video views and engagement rates
          </p>
        </div>

        {/* Task 269-270: Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomIn className="w-5 h-5 rotate-180" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {(zoomLevel * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Task 262: Large Line Chart (1200px × 700px) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={700}>
          <LineChart
            data={scatterData}
            margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* Task 260: Large axis labels (16px font) */}
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ 
                value: 'Videos', 
                position: 'bottom',
                offset: 40,
                style: { fontSize: 18, fontWeight: 'bold', fill: '#374151' }
              }}
            />
            
            <YAxis
              tick={{ fontSize: 16, fill: '#6b7280' }}
              label={{ 
                value: 'Engagement Rate (%)', 
                angle: -90,
                position: 'left',
                offset: 50,
                style: { fontSize: 18, fontWeight: 'bold', fill: '#374151' }
              }}
              domain={[0, 'auto']}
            />
            
            {/* Task 263: Average engagement reference line */}
            <ReferenceLine
              y={averages.avgEngagement}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Avg: ${averages.avgEngagement.toFixed(2)}%`,
                position: 'right',
                fill: '#6b7280',
                fontSize: 14,
                fontWeight: 'bold',
              }}
            />

            {/* Task 264: Custom tooltip */}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Task 260: Legend */}
            <Legend
              verticalAlign="top"
              height={50}
              wrapperStyle={{ fontSize: 16, paddingBottom: 20 }}
            />
            
            {/* Line with gradient colors based on engagement */}
            <Line
              type="monotone"
              dataKey="y"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = getDotColor(payload.y);
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8 }}
              name="Engagement Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task 268: Insight panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {scatterData.filter(d => d.y >= averages.avgEngagement * 1.5).length}
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            High Engagement Videos
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            ≥{(averages.avgEngagement * 1.5).toFixed(2)}% engagement rate
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {averages.avgEngagement.toFixed(2)}%
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Average Engagement Rate
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Across {videos.length} videos
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {averages.avgViews.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Average Views
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Per video benchmark
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementBreakdown;