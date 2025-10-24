/**
 * Authentication Test Page
 * Tests Tasks 101-110
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTestPage = () => {
  const {
    user,
    token,
    loading,
    error,
    isGuest,
    quotaRemaining,
    isAuthenticated,
    loginAsGuest,
    logout,
    refreshGuestSession,
    getSessionTimeRemaining,
  } = useAuth();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResults, setTestResults] = useState([]);

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [getSessionTimeRemaining]);

  // Format milliseconds to readable time
  const formatTime = (ms) => {
    if (ms <= 0) return 'Expired';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Add test result
  const addTestResult = (test, passed, message) => {
    setTestResults(prev => [...prev, { test, passed, message, timestamp: new Date() }]);
  };

  // Test 1: Login as Guest
  const testLoginAsGuest = async () => {
    addTestResult('Login as Guest', null, 'Testing...');
    const result = await loginAsGuest();
    addTestResult('Login as Guest', result.success, result.success ? 'Login successful' : result.error);
  };

  // Test 2: Check Auth Status
  const testCheckAuthStatus = () => {
    const hasToken = !!token;
    const hasUser = !!user;
    addTestResult('Check Auth Status', hasToken && hasUser, 
      `Token: ${hasToken ? 'Present' : 'Missing'}, User: ${hasUser ? 'Present' : 'Missing'}`);
  };

  // Test 3: Refresh Session
  const testRefreshSession = async () => {
    if (!isAuthenticated) {
      addTestResult('Refresh Session', false, 'Not authenticated. Login first.');
      return;
    }
    
    addTestResult('Refresh Session', null, 'Refreshing...');
    const result = await refreshGuestSession();
    addTestResult('Refresh Session', result.success, result.success ? result.message : result.error);
  };

  // Test 4: Logout
  const testLogout = async () => {
    addTestResult('Logout', null, 'Logging out...');
    await logout();
    addTestResult('Logout', true, 'Logged out successfully');
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
      <div className="container-desktop">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-gradient">Authentication Test</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tasks 101-110 Verification
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card p-6 mb-6 text-center">
            <div className="animate-pulse-slow text-2xl">⏳ Loading...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card p-6 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Current Auth State */}
        <section className="mb-8">
          <h2 className="section-title">Current Authentication State</h2>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Status Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Authenticated:</span>
                  <span className={isAuthenticated ? 'badge-success' : 'badge-danger'}>
                    {isAuthenticated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User Type:</span>
                  <span className="badge-warning">{isGuest ? 'Guest' : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Loading:</span>
                  <span>{loading ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Session Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                  <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quota Remaining:</span>
                  <span className="font-bold">{quotaRemaining}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Token:</span>
                  <span className="text-xs font-mono truncate max-w-[200px]">
                    {token ? `${token.substring(0, 20)}...` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="card p-6 col-span-2">
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Display Name:</span>
                    <div className="font-medium">{user.displayName || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Guest ID:</span>
                    <div className="font-mono text-sm">{user.guestId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quota Used:</span>
                    <div className="font-medium">{user.quotaUsed || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quota Limit:</span>
                    <div className="font-medium">{user.quotaLimit || 100}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Test Actions */}
        <section className="mb-8">
          <h2 className="section-title">Test Actions</h2>
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={testLoginAsGuest}
                disabled={isAuthenticated || loading}
                className="btn-primary"
              >
                🔐 Test Login as Guest
              </button>
              
              <button 
                onClick={testCheckAuthStatus}
                className="btn-secondary"
              >
                ✅ Test Check Auth Status
              </button>
              
              <button 
                onClick={testRefreshSession}
                disabled={!isAuthenticated || loading}
                className="btn-secondary"
              >
                🔄 Test Refresh Session
              </button>
              
              <button 
                onClick={testLogout}
                disabled={!isAuthenticated || loading}
                className="btn-danger"
              >
                🚪 Test Logout
              </button>
            </div>
          </div>
        </section>

        {/* Test Results */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">Test Results</h2>
            <button onClick={clearResults} className="btn-secondary !min-h-[40px] !py-2">
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                No tests run yet. Click a test button above to start.
              </div>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`card p-4 ${
                    result.passed === true ? 'bg-green-50 dark:bg-green-900/20' :
                    result.passed === false ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {result.passed === true ? '✅' : result.passed === false ? '❌' : '⏳'} {result.test}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.message}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Instructions */}
        <section className="mt-8">
          <div className="card p-6 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-3">📝 Testing Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Make sure your backend server is running on <code>http://localhost:5000</code></li>
              <li>Click "Test Login as Guest" to authenticate</li>
              <li>Watch the session info update with quota and time remaining</li>
              <li>Test "Check Auth Status" to verify state persistence</li>
              <li>Test "Refresh Session" to extend your session by 24h</li>
              <li>Test "Logout" to clear session and return to home</li>
              <li>Check browser localStorage for 'auth_token' and 'token_expiry'</li>
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AuthTestPage;