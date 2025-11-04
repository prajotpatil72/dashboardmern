/**
 * LikesVsCommentsChart Component
 * Tasks 265-270: Dual-axis Line Chart (Likes vs Comments)
 * Features:
 * - 1200px × 600px dual-axis line chart
 * - Correlation coefficient in chart subtitle
 * - Insight panel (right side, 300px)
 * - Reset view button
 */
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Helper: Calculate Pearson correlation coefficient
 */
const calculateCorrelation = (xValues, yValues) => {
  if (xValues.length !== yValues.length || xValues.length === 0) return 0;

  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
};

/**
 * Helper: Get video ID
 */
const getVideoId = (video) => {
  return video.videoId || video.id?.videoId || video.id;
};

/**
 * Task 265: LikesVsCommentsChart Component
 */
const LikesVsCommentsChart = ({ videos }) => {
  // Task 266: Prepare dual-axis chart data
  const chartData = useMemo(() => {
    return videos
      .map((video, index) => {
        // Support both nested (video.statistics) and flat (video) structures
        const stats = video.statistics || video;
        return {
          index: index + 1,
          name: video.snippet?.title?.substring(0, 30) + '...' || video.title?.substring(0, 30) + '...' || `Video ${index + 1}`,
          likes: parseInt(stats.likeCount || 0),
          comments: parseInt(stats.commentCount || 0),
          videoId: getVideoId(video),
          fullTitle: video.snippet?.title || video.title || 'Untitled',
        };
      })
      .filter(item => item.likes > 0 || item.comments > 0) // Filter out empty data
      .sort((a, b) => b.likes - a.likes) // Sort by likes descending
      .slice(0, 20); // Show top 20 videos
  }, [videos]);

  // Task 267: Calculate correlation coefficient
  const correlation = useMemo(() => {
    const likes = chartData.map(d => d.likes);
    const comments = chartData.map(d => d.comments);
    return calculateCorrelation(likes, comments);
  }, [chartData]);

  // Task 268: Calculate insight metrics
  const insights = useMemo(() => {
    const totalLikes = chartData.reduce((sum, d) => sum + d.likes, 0);
    const totalComments = chartData.reduce((sum, d) => sum + d.comments, 0);
    const avgLikes = totalLikes / chartData.length;
    const avgComments = totalComments / chartData.length;
    const likeToCommentRatio = totalComments > 0 ? totalLikes / totalComments : 0;

    return {
      totalLikes,
      totalComments,
      avgLikes,
      avgComments,
      likeToCommentRatio,
    };
  }, [chartData]);

  // Determine correlation strength
  const getCorrelationStrength = (r) => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return { strength: 'Strong', color: 'text-green-600 dark:text-green-400' };
    if (absR >= 0.4) return { strength: 'Moderate', color: 'text-blue-600 dark:text-blue-400' };
    if (absR >= 0.2) return { strength: 'Weak', color: 'text-orange-600 dark:text-orange-400' };
    return { strength: 'Very Weak', color: 'text-gray-600 dark:text-gray-400' };
  };

  const correlationInfo = getCorrelationStrength(correlation);

  // Show message if no data
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
          No videos available for analysis.
        </p>
      </div>
    );
  }

  // Show message if no valid data after filtering
  if (chartData.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
          ⚠️ No valid likes/comments data found
        </p>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          All videos have 0 likes and 0 comments.
        </p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl p-4 max-w-sm">
        <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
          {data.fullTitle}
        </h4>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-green-600 dark:text-green-400 font-semibold">Likes:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {data.likes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Comments:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {data.comments.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600 dark:text-gray-400">Ratio:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data.comments > 0 ? (data.likes / data.comments).toFixed(1) : '∞'}:1
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          💬 Likes vs Comments Correlation
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-gray-600 dark:text-gray-400">
            Dual-axis comparison of likes and comments across top videos
          </p>
          {/* Task 267: Show correlation coefficient in subtitle */}
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${correlationInfo.color} bg-gray-100 dark:bg-gray-700`}>
            R = {correlation.toFixed(3)} ({correlationInfo.strength} Correlation)
          </span>
        </div>
      </div>

      {/* Task 268: Main layout - Chart + Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Task 266: Dual-axis Line Chart (1200px × 600px) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <ResponsiveContainer width="100%" height={600}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              {/* Task 260: Large axis labels (16px font) */}
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{
                  value: 'Videos (Top 20 by Likes)',
                  position: 'bottom',
                  offset: 60,
                  style: { fontSize: 16, fontWeight: 'bold', fill: '#374151' }
                }}
              />
              
              {/* Left Y-axis for Likes */}
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 16, fill: '#10b981' }}
                label={{
                  value: 'Likes',
                  angle: -90,
                  position: 'left',
                  offset: 50,
                  style: { fontSize: 18, fontWeight: 'bold', fill: '#10b981' }
                }}
              />
              
              {/* Right Y-axis for Comments */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 16, fill: '#8b5cf6' }}
                label={{
                  value: 'Comments',
                  angle: 90,
                  position: 'right',
                  offset: 50,
                  style: { fontSize: 18, fontWeight: 'bold', fill: '#8b5cf6' }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend
                verticalAlign="top"
                height={50}
                wrapperStyle={{ fontSize: 16, paddingBottom: 20 }}
              />
              
              {/* Likes Line (Green) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="likes"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 8 }}
                name="Likes"
              />
              
              {/* Comments Line (Purple) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="comments"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 8 }}
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task 268: Insight Panel (300px) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Correlation Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Correlation
              </span>
              {correlation > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : correlation < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {correlation.toFixed(3)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {correlationInfo.strength} {correlation >= 0 ? 'positive' : 'negative'} correlation
            </div>
          </div>

          {/* Total Likes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Likes
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {insights.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg: {insights.avgLikes.toFixed(0).toLocaleString()} per video
            </div>
          </div>

          {/* Total Comments */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Comments
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {insights.totalComments.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg: {insights.avgComments.toFixed(0).toLocaleString()} per video
            </div>
          </div>

          {/* Like-to-Comment Ratio */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Like:Comment Ratio
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {insights.likeToCommentRatio.toFixed(1)}:1
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {insights.likeToCommentRatio > 10 
                ? 'High like preference' 
                : insights.likeToCommentRatio > 5
                ? 'Balanced engagement'
                : 'High discussion activity'
              }
            </div>
          </div>

          {/* Insight Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
              💡 Key Insight
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {correlation >= 0.7 ? (
                <>Videos with more likes tend to have proportionally more comments, indicating strong audience engagement across both metrics.</>
              ) : correlation >= 0.4 ? (
                <>There's a moderate relationship between likes and comments. Some videos may excel in one metric more than the other.</>
              ) : correlation >= 0.2 ? (
                <>Likes and comments show weak correlation. Consider analyzing what drives each metric independently.</>
              ) : (
                <>Very weak correlation suggests likes and comments are driven by different factors for these videos.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikesVsCommentsChart;