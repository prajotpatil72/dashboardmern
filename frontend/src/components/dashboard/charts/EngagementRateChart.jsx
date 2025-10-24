/**
 * EngagementRateChart Component
 * Tasks 255-258: Horizontal Bar Chart (1000px × 600px) showing engagement rates
 * Add average engagement line overlay and insight card
 */
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

const EngagementRateChart = ({ videos }) => {
  // Prepare data
  const { chartData, avgEngagement, highEngagementCount } = useMemo(() => {
    if (!videos || videos.length === 0) {
      return { chartData: [], avgEngagement: 0, highEngagementCount: 0 };
    }

    // Sort by engagement rate
    const sortedVideos = [...videos]
      .sort((a, b) => parseFloat(b.engagementRate || 0) - parseFloat(a.engagementRate || 0))
      .slice(0, 20);

    const data = sortedVideos.map((video, index) => ({
      name: video.title?.substring(0, 30) + '...' || `Video ${index + 1}`,
      engagement: parseFloat(video.engagementRate || 0),
      fullTitle: video.title,
      views: parseInt(video.viewCount || 0),
    }));

    // Calculate average engagement
    const total = videos.reduce((sum, v) => sum + parseFloat(v.engagementRate || 0), 0);
    const avg = total / videos.length;

    // Count videos with >5% engagement
    const highCount = videos.filter(v => parseFloat(v.engagementRate || 0) > 5).length;

    return {
      chartData: data,
      avgEngagement: avg,
      highEngagementCount: highCount,
    };
  }, [videos]);

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
          <strong>Engagement Rate:</strong> {data.engagement.toFixed(2)}%
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Views:</strong> {data.views.toLocaleString()}
        </p>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Engagement Rate Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Top 20 videos by engagement rate with average line overlay
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Task 256: Horizontal Bar Chart */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fontSize: 14, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                width={140}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '16px' }}
                iconType="square"
              />
              {/* Task 257: Add average engagement line overlay (dashed) */}
              <ReferenceLine
                x={avgEngagement}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Avg: ${avgEngagement.toFixed(2)}%`,
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              />
              <Bar
                dataKey="engagement"
                name="Engagement Rate (%)"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task 258: Insight card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Key Insights
              </h4>
            </div>

            <div className="space-y-4">
              {/* High engagement count */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {highEngagementCount}/{videos.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Videos with &gt;5% engagement
                </div>
              </div>

              {/* Average engagement */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {avgEngagement.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average engagement rate
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Videos with engagement above {avgEngagement.toFixed(1)}% 
                  are performing better than average. Focus on creating similar content!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementRateChart;