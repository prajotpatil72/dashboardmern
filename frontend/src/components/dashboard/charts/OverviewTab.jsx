/**
 * OverviewTab Component
 * Task 259: Display charts in 2-column grid
 * Combines PerformanceOverview and EngagementRateChart
 */
import React from 'react';
import PerformanceOverview from './PerformanceOverview';
import EngagementRateChart from './EngagementRateChart';

const OverviewTab = ({ videos }) => {
  return (
    <div className="space-y-8">
      {/* Full-width Performance Overview */}
      <PerformanceOverview videos={videos} />

      {/* Full-width Engagement Rate Chart with Insights */}
      <EngagementRateChart videos={videos} />
    </div>
  );
};

export default OverviewTab;