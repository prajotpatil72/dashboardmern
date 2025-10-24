/**
 * DashboardSkeleton Component
 * Task 249: Loading skeleton for entire dashboard
 */
import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-xl h-32"></div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>

      {/* Export Buttons Skeleton */}
      <div className="flex gap-3">
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-12 w-40"></div>
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-12 w-40"></div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-20"></div>

      {/* Content Area Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="bg-gray-300 dark:bg-gray-700 h-6 w-48 mx-auto rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
