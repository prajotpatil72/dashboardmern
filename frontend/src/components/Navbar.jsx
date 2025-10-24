/**
 * Navbar Component - Updated with dynamic quota
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [quotaUsed, setQuotaUsed] = useState(0);
  const quotaLimit = 100;

  // Load quota from localStorage
  useEffect(() => {
    const savedQuota = localStorage.getItem('quotaUsed');
    if (savedQuota) {
      setQuotaUsed(parseInt(savedQuota));
    }

    // Listen for quota changes
    const handleStorageChange = () => {
      const newQuota = localStorage.getItem('quotaUsed');
      if (newQuota) {
        setQuotaUsed(parseInt(newQuota));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for quota changes (for same-tab updates)
    const interval = setInterval(() => {
      const newQuota = localStorage.getItem('quotaUsed');
      if (newQuota && parseInt(newQuota) !== quotaUsed) {
        setQuotaUsed(parseInt(newQuota));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [quotaUsed]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const getQuotaColor = () => {
    const percentage = (quotaUsed / quotaLimit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">YT</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            YouTube Analytics
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/search'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Search
          </Link>
          <Link
            to="/analytics"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/analytics'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Analytics
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Quota Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {quotaUsed}/{quotaLimit} searches
            </span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getQuotaColor()} transition-all duration-300`}
                style={{ width: `${(quotaUsed / quotaLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Daily quota label */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Daily quota
          </span>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Guest User
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user._id?.slice(-6) || ''}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;