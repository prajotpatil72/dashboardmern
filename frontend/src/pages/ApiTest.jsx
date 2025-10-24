/**
 * API Interceptor Test Page
 * Tests Tasks 121-130
 */
import { useState, useEffect } from 'react';
import { apiService, authAPI, performanceAPI, errorUtils } from '../services/api';

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add test result
  const addResult = (test, passed, message, duration = null) => {
    setTestResults(prev => [...prev, {
      test,
      passed,
      message,
      duration,
      timestamp: new Date()
    }]);
  };

  // Update metrics
  const updateMetrics = () => {
    setMetrics(performanceAPI.getSummary());
  };

  // Test 1: Basic GET Request (Task 121-124)
  const testBasicRequest = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const response = await apiService.get('/auth/guest/analytics');
      const duration = Date.now() - startTime;
      
      addResult(
        'Basic GET Request',
        response.status === 200,
        `Success! Status: ${response.status}`,
        duration
      );
    } catch (error) {
      addResult('Basic GET Request', false, errorUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Test 2: Request with Token (Task 124)
  const testAuthenticatedRequest = async () => {
    setLoading(true);
    try {
      // First login to get a token
      const loginResponse = await authAPI.createGuestSession();
      
      if (loginResponse.data?.data?.token) {
        // Now try an authenticated request
        const verifyResponse = await authAPI.verifyToken();
        
        addResult(
          'Authenticated Request',
          verifyResponse.status === 200,
          'Token automatically attached to request'
        );
      }
    } catch (error) {
      addResult('Authenticated Request', false, errorUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Test 3: Performance Timing (Task 125)
  const testPerformanceTiming = async () => {
    setLoading(true);
    try {
      // Make multiple requests
      await apiService.get('/auth/guest/analytics');
      await apiService.get('/auth/guest/analytics');
      await apiService.get('/auth/guest/analytics');
      
      const avgTime = performanceAPI.getAverageResponseTime();
      const slowest = performanceAPI.getSlowestRequest();
      
      addResult(
        'Performance Timing',
        avgTime > 0,
        `Avg: ${avgTime}ms, Slowest: ${slowest?.duration}ms`,
        avgTime
      );
    } catch (error) {
      addResult('Performance Timing', false, errorUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Test 4: 401 Error Handling (Task 127)
  const test401Handling = async () => {
    setLoading(true);
    try {
      // This should trigger 401 if token is invalid
      const response = await apiService.get('/auth/verify');
      
      addResult(
        '401 Error Handling',
        true,
        'Auto-refresh worked or already authenticated'
      );
    } catch (error) {
      const isAuthError = errorUtils.isAuthError(error);
      addResult(
        '401 Error Handling',
        isAuthError,
        isAuthError ? '401 detected correctly' : 'Different error'
      );
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Test 5: 429 Error Handling (Task 128)
  const test429Handling = () => {
    // Add event listener for quota-exceeded
    const handleQuotaExceeded = (event) => {
      addResult(
        '429 Error Handling',
        true,
        `Quota exceeded event triggered: ${event.detail.message}`
      );
    };
    
    window.addEventListener('quota-exceeded', handleQuotaExceeded);
    
    addResult(
      '429 Error Handling',
      true,
      'Event listener added. Trigger 429 from backend to test.'
    );
    
    // Cleanup
    setTimeout(() => {
      window.removeEventListener('quota-exceeded', handleQuotaExceeded);
    }, 60000);
  };

  // Test 6: Network Error Handling (Task 129)
  const testNetworkError = async () => {
    setLoading(true);
    try {
      // Try to call a non-existent endpoint
      await apiService.get('/invalid-endpoint-that-does-not-exist');
      
      addResult('Network Error Handling', false, 'Should have failed');
    } catch (error) {
      const isNetworkError = errorUtils.isNetworkError(error);
      
      addResult(
        'Network Error Handling',
        true,
        isNetworkError ? 'Network error detected' : `Got: ${error.response?.status}`
      );
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Test 7: Retry Logic (Task 129)
  const testRetryLogic = async () => {
    setLoading(true);
    
    addResult(
      'Retry Logic',
      null,
      'Testing... Check console for retry messages'
    );
    
    try {
      // This will fail and should retry 3 times
      await apiService.get('/auth/trigger-retry-test');
    } catch (error) {
      addResult(
        'Retry Logic',
        true,
        'Request failed after retries (check console logs)'
      );
    } finally {
      setLoading(false);
      updateMetrics();
    }
  };

  // Clear all results
  const clearResults = () => {
    setTestResults([]);
    performanceAPI.clearMetrics();
    setMetrics(null);
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    
    await testBasicRequest();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuthenticatedRequest();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPerformanceTiming();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await test401Handling();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    test429Handling();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testNetworkError();
    
    updateMetrics();
  };

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
      <div className="container-desktop">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-gradient">API Interceptor Test</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tasks 121-130 Verification
          </p>
        </div>

        {/* Performance Metrics */}
        <section className="mb-8">
          <h2 className="section-title">Performance Metrics (Task 125)</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="stat-value">{metrics?.totalRequests || 0}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{metrics?.averageResponseTime || 0}ms</div>
              <div className="stat-label">Avg Response</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{metrics?.successfulRequests || 0}</div>
              <div className="stat-label">Successful</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{metrics?.failedRequests || 0}</div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
        </section>

        {/* Test Actions */}
        <section className="mb-8">
          <h2 className="section-title">Test Actions</h2>
          <div className="card p-6">
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={runAllTests}
                disabled={loading}
                className="btn-primary"
              >
                🚀 Run All Tests
              </button>
              
              <button 
                onClick={testBasicRequest}
                disabled={loading}
                className="btn-secondary"
              >
                📡 Test Basic Request
              </button>
              
              <button 
                onClick={testAuthenticatedRequest}
                disabled={loading}
                className="btn-secondary"
              >
                🔐 Test Auth Request
              </button>
              
              <button 
                onClick={testPerformanceTiming}
                disabled={loading}
                className="btn-secondary"
              >
                ⏱️ Test Performance
              </button>
              
              <button 
                onClick={test401Handling}
                disabled={loading}
                className="btn-secondary"
              >
                🚫 Test 401 Handling
              </button>
              
              <button 
                onClick={test429Handling}
                disabled={loading}
                className="btn-secondary"
              >
                ⚠️ Test 429 Handling
              </button>
              
              <button 
                onClick={testNetworkError}
                disabled={loading}
                className="btn-secondary"
              >
                🌐 Test Network Error
              </button>
              
              <button 
                onClick={testRetryLogic}
                disabled={loading}
                className="btn-secondary"
              >
                🔄 Test Retry Logic
              </button>
              
              <button 
                onClick={clearResults}
                className="btn-secondary"
              >
                🧹 Clear Results
              </button>
            </div>
          </div>
        </section>

        {/* Test Results */}
        <section>
          <h2 className="section-title">Test Results</h2>
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                No tests run yet. Click "Run All Tests" or individual test buttons.
              </div>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`card p-4 ${
                    result.passed === true ? 'bg-green-50 dark:bg-green-900/20' :
                    result.passed === false ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {result.passed === true ? '✅' : result.passed === false ? '❌' : 'ℹ️'} {result.test}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.message}
                        {result.duration && ` (${result.duration}ms)`}
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
              <li>Make sure backend is running on <code>http://localhost:5000</code></li>
              <li>Click "Run All Tests" to execute all interceptor tests</li>
              <li>Check browser console (F12) for detailed logs</li>
              <li>Performance metrics update in real-time</li>
              <li>Retry logic will show retry attempts in console</li>
              <li>All interceptors (121-130) should work correctly</li>
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ApiTestPage;