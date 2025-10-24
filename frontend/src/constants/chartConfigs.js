/**
 * Task 90: Chart Configuration Constants
 * Desktop-optimized chart settings for Recharts
 */

export const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  
  series: [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7',
  ],
  
  engagement: {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  },
};

export const CHART_DIMENSIONS = {
  small: { width: 600, height: 400 },
  medium: { width: 1000, height: 500 },
  large: { width: 1200, height: 700 },
  xlarge: { width: 1400, height: 800 },
};

export const formatters = {
  number: (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },
  percentage: (value) => `${value.toFixed(2)}%`,
  duration: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },
};