/**
 * Sidebar Component (Tasks 143-145)
 * Fixed navigation sidebar with active route highlighting
 */
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  BarChart3, 
  Wrench, 
  Settings 
} from 'lucide-react';

function Sidebar() {
  // Task 144: Navigation items
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-60 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-dark-border">
        <h1 className="text-xl font-bold text-gradient">
          YT Analytics
        </h1>
      </div>
      
      {/* Task 143-145: Navigation Links with Active Highlighting */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={isActive ? 'text-primary-600 dark:text-primary-400' : ''} 
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer - Version or Info */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;