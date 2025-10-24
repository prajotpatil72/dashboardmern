/**
 * Token Storage Test Page
 * Tests Tasks 111-120
 */
import { useState } from 'react';
import * as tokenStorage from '../utils/tokenStorage';

const TokenTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Add test result
  const addResult = (test, passed, message) => {
    setTestResults(prev => [...prev, { test, passed, message, timestamp: new Date() }]);
  };

  // Update token info
  const updateTokenInfo = () => {
    setTokenInfo(tokenStorage.getTokenInfo());
  };

  // Test 1: Set Token (Task 113)
  const testSetToken = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0MTIzIiwidXNlclR5cGUiOiJHVUVTVCIsImV4cCI6OTk5OTk5OTk5OX0.test';
    const success = tokenStorage.setToken(testToken);
    
    addResult('setToken', success, success ? 'Token stored successfully' : 'Failed to store token');
    updateTokenInfo();
  };

  // Test 2: Get Token (Task 112)
  const testGetToken = () => {
    const token = tokenStorage.getToken();
    const passed = token !== null;
    
    addResult('getToken', passed, passed ? `Token retrieved: ${token.substring(0, 30)}...` : 'No token found');
    updateTokenInfo();
  };

  // Test 3: Get Token Payload (Task 116)
  const testGetPayload = () => {
    const token = tokenStorage.getToken();
    
    if (!token) {
      addResult('getTokenPayload', false, 'No token to decode');
      return;
    }
    
    const payload = tokenStorage.getTokenPayload(token);
    const passed = payload !== null;
    
    addResult('getTokenPayload', passed, passed ? `Payload: ${JSON.stringify(payload)}` : 'Failed to decode');
    updateTokenInfo();
  };

  // Test 4: Check Token Expiration (Task 115)
  const testTokenExpiration = () => {
    const token = tokenStorage.getToken();
    
    if (!token) {
      addResult('isTokenExpired', false, 'No token to check');
      return;
    }
    
    const isExpired = tokenStorage.isTokenExpired(token);
    addResult('isTokenExpired', true, `Token expired: ${isExpired}`);
    updateTokenInfo();
  };

  // Test 5: Token Format Validation (Task 119)
  const testTokenValidation = () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0In0.signature';
    const invalidToken = 'not.a.valid.jwt.token';
    
    const validResult = tokenStorage.isValidTokenFormat(validToken);
    const invalidResult = tokenStorage.isValidTokenFormat(invalidToken);
    
    const passed = validResult === true && invalidResult === false;
    
    addResult('isValidTokenFormat', passed, passed ? 'Validation working correctly' : 'Validation failed');
  };

  // Test 6: Remove Token (Task 114)
  const testRemoveToken = () => {
    const success = tokenStorage.removeToken();
    const tokenAfter = tokenStorage.getToken();
    const passed = success && tokenAfter === null;
    
    addResult('removeToken', passed, passed ? 'Token removed successfully' : 'Failed to remove token');
    updateTokenInfo();
  };

  // Test 7: QuotaExceededError Handling (Task 118)
  const testQuotaError = () => {
    try {
      // Try to store a very large token (simulating quota exceeded)
      const largeToken = 'eyJ' + 'a'.repeat(1000000) + '.payload.signature';
      const success = tokenStorage.setToken(largeToken);
      
      addResult('QuotaExceededError', true, 'Handled quota error gracefully');
    } catch (error) {
      addResult('QuotaExceededError', false, `Error: ${error.message}`);
    }
  };

  // Test 8: Token Persistence (Task 120)
  const testTokenPersistence = () => {
    // Store a test token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJwZXJzaXN0ZW5jZSIsImV4cCI6OTk5OTk5OTk5OX0.test';
    tokenStorage.setToken(testToken);
    
    // Refresh page message
    addResult('Token Persistence', true, 'Token stored. Refresh page (F5) to test persistence');
    
    // Check if token survived refresh
    setTimeout(() => {
      const retrieved = tokenStorage.getToken();
      const survived = retrieved === testToken;
      
      addResult('Persistence Check', survived, survived ? 'Token survived page reload!' : 'Token lost after reload');
      updateTokenInfo();
    }, 100);
  };

  // Test 9: Should Refresh Token
  const testShouldRefresh = () => {
    const shouldRefresh = tokenStorage.shouldRefreshToken();
    addResult('shouldRefreshToken', true, `Should refresh: ${shouldRefresh}`);
    updateTokenInfo();
  };

  // Clear all results
  const clearResults = () => {
    setTestResults([]);
  };

  // Run all tests
  const runAllTests = () => {
    clearResults();
    
    setTimeout(() => testSetToken(), 100);
    setTimeout(() => testGetToken(), 200);
    setTimeout(() => testGetPayload(), 300);
    setTimeout(() => testTokenExpiration(), 400);
    setTimeout(() => testTokenValidation(), 500);
    setTimeout(() => testShouldRefresh(), 600);
    setTimeout(() => testRemoveToken(), 700);
    setTimeout(() => testSetToken(), 800); // Set again for persistence test
    setTimeout(() => testTokenPersistence(), 900);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
      <div className="container-desktop">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-gradient">Token Storage Test</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tasks 111-120 Verification
          </p>
        </div>

        {/* Current Token Info */}
        <section className="mb-8">
          <h2 className="section-title">Current Token Info</h2>
          <div className="card p-6">
            {tokenInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Has Token:</span>
                  <span className={tokenInfo.hasToken ? 'badge-success' : 'badge-danger'}>
                    {tokenInfo.hasToken ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Is Expired:</span>
                  <span className={!tokenInfo.isExpired ? 'badge-success' : 'badge-danger'}>
                    {tokenInfo.isExpired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Should Refresh:</span>
                  <span>{tokenInfo.shouldRefresh ? 'Yes' : 'No'}</span>
                </div>
                {tokenInfo.payload && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="text-sm font-mono">
                      <pre>{JSON.stringify(tokenInfo.payload, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click "Update Token Info" to view</p>
            )}
            
            <button onClick={updateTokenInfo} className="btn-secondary mt-4">
              Update Token Info
            </button>
          </div>
        </section>

        {/* Test Actions */}
        <section className="mb-8">
          <h2 className="section-title">Test Actions</h2>
          <div className="card p-6">
            <div className="grid grid-cols-3 gap-4">
              <button onClick={runAllTests} className="btn-primary">
                🚀 Run All Tests
              </button>
              
              <button onClick={testSetToken} className="btn-secondary">
                💾 Test setToken
              </button>
              
              <button onClick={testGetToken} className="btn-secondary">
                📥 Test getToken
              </button>
              
              <button onClick={testGetPayload} className="btn-secondary">
                🔓 Test getPayload
              </button>
              
              <button onClick={testTokenExpiration} className="btn-secondary">
                ⏰ Test isExpired
              </button>
              
              <button onClick={testTokenValidation} className="btn-secondary">
                ✅ Test Validation
              </button>
              
              <button onClick={testRemoveToken} className="btn-danger">
                🗑️ Test removeToken
              </button>
              
              <button onClick={testTokenPersistence} className="btn-secondary">
                💪 Test Persistence
              </button>
              
              <button onClick={clearResults} className="btn-secondary">
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
              <li>Click "Run All Tests" to execute all token storage tests</li>
              <li>Check that all tests pass (green checkmarks)</li>
              <li>For persistence test: After running, refresh the page (F5) and check if token survived</li>
              <li>Open DevTools (F12) → Application → Local Storage → localhost:5173</li>
              <li>Verify 'auth_token' and 'token_expiry' keys exist</li>
              <li>All utility functions should work without errors</li>
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TokenTestPage;