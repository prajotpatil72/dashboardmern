/**
 * EngagementTab Component
 * Tasks 261-270: Engagement Analytics with Interactive Charts
 * Features: Scatter plot (Views vs Engagement) and Dual-axis chart (Likes vs Comments)
 */
import React from 'react';
import EngagementBreakdown from './EngagementBreakdown';
import LikesVsCommentsChart from './LikesVsCommentsChart';

const EngagementTab = ({ videos }) => {
  return (
    <div className="space-y-8">
      {/* Task 261-264: Scatter Plot - Views vs Engagement */}
      <EngagementBreakdown videos={videos} />

      {/* Task 265-270: Dual-axis Line Chart - Likes vs Comments */}
      <LikesVsCommentsChart videos={videos} />
    </div>
  );
};

export default EngagementTab;