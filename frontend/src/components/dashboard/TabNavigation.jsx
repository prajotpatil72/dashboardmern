/**
 * TabNavigation Component
 * Task 243: Implement tab navigation for dashboard
 */
import React from 'react';
import { BarChart3, Heart, Lightbulb, Tag, Settings } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Performance metrics',
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: Heart,
      description: 'Likes & comments',
    },
    {
      id: 'content-strategy',
      label: 'Content Strategy',
      icon: Lightbulb,
      description: 'Optimal timing',
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: Tag,
      description: 'Keyword analysis',
    },
    {
      id: 'custom',
      label: 'Custom',
      icon: Settings,
      description: 'Custom charts',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg
                font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <div className="text-left">
                <div className="text-sm font-bold">{tab.label}</div>
                <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
