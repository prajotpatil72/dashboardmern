/**
 * CustomChartBuilder Component - WITH LANDING PAGE
 * Tasks 291-300: Interactive chart builder with user-selected metrics
 * Uses real video data (no mock data)
 */
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, LineChart, Line, Area, AreaChart, Cell 
} from 'recharts';
import { Sparkles, Download, RefreshCw, TrendingUp } from 'lucide-react';

const CustomChartBuilder = ({ videos }) => {
  // ========== LANDING PAGE WHEN NO VIDEOS ==========
  if (!videos || videos.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Custom Chart Builder
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create custom visualizations by selecting your metrics and chart types
          </p>
        </div>

        {/* Landing Page Content */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-12 border-2 border-dashed border-purple-300 dark:border-purple-700">
          
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Videos Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Select videos from the search page to start building custom charts
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Scatter Plots</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find correlations</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Bar Charts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compare values</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📈</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Line Charts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track trends</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📉</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Area Charts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visualize totals</p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">✨ Powerful Features</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Custom axis selection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Color coding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Dynamic sizing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Export to CSV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== ACTUAL CHART BUILDER (YOUR EXISTING CODE) ==========
  const [chartType, setChartType] = useState('scatter');
  const [xAxis, setXAxis] = useState('durationMinutes');
  const [yAxis, setYAxis] = useState('viewCount');
  const [colorBy, setColorBy] = useState('categoryName');
  const [sizeBy, setSizeBy] = useState('engagementRate');

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const chartTypes = [
    { value: 'scatter', label: 'Scatter Plot', description: 'Show relationships between two variables' },
    { value: 'bar', label: 'Bar Chart', description: 'Compare values across categories' },
    { value: 'line', label: 'Line Chart', description: 'Show trends over time or continuous data' },
    { value: 'area', label: 'Area Chart', description: 'Visualize cumulative totals' }
  ];

  const axisOptions = [
    { value: 'viewCount', label: 'View Count', type: 'numeric' },
    { value: 'likeCount', label: 'Like Count', type: 'numeric' },
    { value: 'commentCount', label: 'Comment Count', type: 'numeric' },
    { value: 'engagementRate', label: 'Engagement Rate (%)', type: 'numeric' },
    { value: 'durationMinutes', label: 'Duration (minutes)', type: 'numeric' },
    { value: 'ageInDays', label: 'Age (days)', type: 'numeric' },
    { value: 'publishedHour', label: 'Published Hour', type: 'numeric' },
    { value: 'dayOfWeekName', label: 'Day of Week', type: 'category' },
    { value: 'categoryName', label: 'Category', type: 'category' },
    { value: 'channelTitle', label: 'Channel', type: 'category' }
  ];

  const colorOptions = [
    { value: 'categoryName', label: 'Category' },
    { value: 'channelTitle', label: 'Channel' },
    { value: 'engagementRate', label: 'Engagement Rate' },
    { value: 'none', label: 'None (Single Color)' }
  ];

  const sizeOptions = [
    { value: 'engagementRate', label: 'Engagement Rate' },
    { value: 'viewCount', label: 'View Count' },
    { value: 'likeCount', label: 'Like Count' },
    { value: 'none', label: 'None (Fixed Size)' }
  ];

  const processedData = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    return videos.map(v => {
      const publishedFeatures = v.publishedFeatures || {};
      
      return {
        ...v,
        viewCount: parseInt(v.viewCount || 0),
        likeCount: parseInt(v.likeCount || 0),
        commentCount: parseInt(v.commentCount || 0),
        engagementRate: parseFloat(v.engagementRate || 0),
        durationMinutes: v.durationSeconds ? parseFloat((v.durationSeconds / 60).toFixed(1)) : 0,
        ageInDays: publishedFeatures.ageInDays || 0,
        publishedHour: publishedFeatures.hour || 0,
        dayOfWeekName: publishedFeatures.dayOfWeekName || 'Unknown',
        categoryName: v.categoryName || 'Unknown',
        channelTitle: v.channelTitle || 'Unknown'
      };
    });
  }, [videos]);

  const chartData = useMemo(() => {
    if (processedData.length === 0) return [];

    const xOption = axisOptions.find(o => o.value === xAxis);
    const yOption = axisOptions.find(o => o.value === yAxis);

    if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
      if (xOption.type === 'category') {
        const grouped = {};
        processedData.forEach(v => {
          const key = v[xAxis];
          if (!grouped[key]) {
            grouped[key] = { name: key, values: [], count: 0 };
          }
          grouped[key].values.push(v[yAxis]);
          grouped[key].count++;
        });

        return Object.values(grouped).map(g => ({
          name: g.name,
          value: g.values.reduce((a, b) => a + b, 0) / g.values.length,
          count: g.count
        })).sort((a, b) => {
          if (typeof a.name === 'string') return a.name.localeCompare(b.name);
          return a.name - b.name;
        });
      } else {
        return processedData
          .sort((a, b) => a[xAxis] - b[xAxis])
          .map((v, i) => ({
            name: v[xAxis],
            value: v[yAxis],
            title: v.title,
            index: i
          }));
      }
    }

    return processedData.map(v => ({
      x: v[xAxis],
      y: v[yAxis],
      color: colorBy !== 'none' ? v[colorBy] : 'default',
      size: sizeBy !== 'none' ? v[sizeBy] : 100,
      title: v.title,
      channelTitle: v.channelTitle
    }));
  }, [processedData, xAxis, yAxis, colorBy, sizeBy, chartType, axisOptions]);

  const uniqueColors = useMemo(() => {
    if (colorBy === 'none') return { default: '#3b82f6' };
    
    const colors = {};
    const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    let idx = 0;
    
    processedData.forEach(v => {
      const key = v[colorBy];
      if (!colors[key]) {
        colors[key] = palette[idx % palette.length];
        idx++;
      }
    });
    
    return colors;
  }, [processedData, colorBy]);

  const insights = useMemo(() => {
    if (processedData.length === 0) return 'No data available';

    const xOption = axisOptions.find(o => o.value === xAxis);
    const yOption = axisOptions.find(o => o.value === yAxis);

    if (chartType === 'scatter') {
      const xVals = processedData.map(v => v[xAxis]);
      const yVals = processedData.map(v => v[yAxis]);
      const xMean = xVals.reduce((a, b) => a + b, 0) / xVals.length;
      const yMean = yVals.reduce((a, b) => a + b, 0) / yVals.length;
      
      const numerator = xVals.reduce((sum, x, i) => sum + (x - xMean) * (yVals[i] - yMean), 0);
      const denomX = Math.sqrt(xVals.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0));
      const denomY = Math.sqrt(yVals.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0));
      const correlation = numerator / (denomX * denomY);

      let correlationText = '';
      if (Math.abs(correlation) > 0.7) {
        correlationText = correlation > 0 ? 'Strong positive correlation' : 'Strong negative correlation';
      } else if (Math.abs(correlation) > 0.4) {
        correlationText = correlation > 0 ? 'Moderate positive correlation' : 'Moderate negative correlation';
      } else {
        correlationText = 'Weak or no correlation';
      }

      return `${correlationText} (r = ${correlation.toFixed(2)}) between ${xOption.label} and ${yOption.label}`;
    }

    if (chartData.length > 0) {
      const sortedData = [...chartData].sort((a, b) => b.value - a.value);
      return `Highest average ${yOption.label}: ${sortedData[0]?.name} (${formatNumber(sortedData[0]?.value)})`;
    }

    return 'Select different metrics to see insights';
  }, [chartData, xAxis, yAxis, chartType, processedData, axisOptions, formatNumber]);

  const handleReset = () => {
    setChartType('scatter');
    setXAxis('durationMinutes');
    setYAxis('viewCount');
    setColorBy('categoryName');
    setSizeBy('engagementRate');
  };

  const handleExport = () => {
    const xOption = axisOptions.find(o => o.value === xAxis);
    const yOption = axisOptions.find(o => o.value === yAxis);
    
    const headers = ['Title', xOption.label, yOption.label];
    const rows = processedData.map(v => [
      `"${v.title?.replace(/"/g, '""')}"`,
      v[xAxis],
      v[yAxis]
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `custom_chart_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
          {data.title || data.name}
        </p>
        {data.x !== undefined && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>{axisOptions.find(o => o.value === xAxis)?.label}:</strong> {formatNumber(data.x)}
          </p>
        )}
        {data.y !== undefined && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>{axisOptions.find(o => o.value === yAxis)?.label}:</strong> {formatNumber(data.y)}
          </p>
        )}
        {data.value !== undefined && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Average:</strong> {formatNumber(data.value)}
          </p>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[500px] text-gray-500 dark:text-gray-400">
          No data available
        </div>
      );
    }

    const xOption = axisOptions.find(o => o.value === xAxis);
    const yOption = axisOptions.find(o => o.value === yAxis);

    if (chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="x" 
              name={xOption.label}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: xOption.label, position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: 'bold' } }}
              tickFormatter={formatNumber}
            />
            <YAxis 
              dataKey="y" 
              name={yOption.label}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: yOption.label, angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 'bold' } }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={chartData} fill="#3b82f6">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={uniqueColors[entry.color] || '#3b82f6'}
                  r={sizeBy !== 'none' ? Math.max(3, Math.min(entry.size / 10, 15)) : 6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={xOption.type === 'category' ? -45 : 0}
              textAnchor={xOption.type === 'category' ? 'end' : 'middle'}
              height={80}
              tickFormatter={formatNumber}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="value" name={yOption.label} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatNumber}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={yOption.label}
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatNumber}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              name={yOption.label}
              fill="#3b82f6" 
              stroke="#2563eb"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Custom Chart Builder</h2>
              <p className="text-blue-100">Create your own visualizations from selected videos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Chart Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Chart Type
            </label>
            <div className="space-y-2">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    chartType === type.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`font-semibold text-sm mb-1 ${
                    chartType === type.value ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* X-Axis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              X-Axis
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 focus:outline-none text-sm"
            >
              {axisOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Y-Axis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Y-Axis
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 focus:outline-none text-sm"
            >
              {axisOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color By (Only for scatter) */}
          {chartType === 'scatter' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                Color By
              </label>
              <select
                value={colorBy}
                onChange={(e) => setColorBy(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 focus:outline-none text-sm"
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Size By (Only for scatter) */}
          {chartType === 'scatter' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                Size By
              </label>
              <select
                value={sizeBy}
                onChange={(e) => setSizeBy(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 focus:outline-none text-sm"
              >
                {sizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {chartTypes.find(t => t.value === chartType)?.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {axisOptions.find(o => o.value === xAxis)?.label} vs {axisOptions.find(o => o.value === yAxis)?.label}
              </p>
            </div>
            {renderChart()}
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Insight</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">{insights}</p>
              </div>
            </div>
          </div>

          {/* Legend (for color coding) */}
          {chartType === 'scatter' && colorBy !== 'none' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Color Legend</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(uniqueColors).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomChartBuilder;