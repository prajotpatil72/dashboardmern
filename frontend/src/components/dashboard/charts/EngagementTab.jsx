/**
 * EngagementTab Component
 * Tasks 261-270: Engagement Analytics with Interactive Charts
 * UPDATED: Removed Likes vs Comments Correlation chart
 * Features: Scatter plot (Views vs Engagement)
 */
import React from 'react';
import EngagementBreakdown from './EngagementBreakdown';

const EngagementTab = ({ videos }) => {
  return (
    <div className="space-y-8">
      {/* Task 261-264: Scatter Plot - Views vs Engagement */}
      <EngagementBreakdown videos={videos} />
    </div>
  );
};

export default EngagementTab;