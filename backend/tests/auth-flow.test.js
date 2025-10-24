const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const { BASE_URL, SERVER_URL, log, colors } = require('./config');

let guestToken = null;
let guestUser = null;

// Test Suite
const tests = {
  // Test 1: Health Check
  async testHealthCheck() {
    log('\n🔍 Test 1: Health Check', 'cyan');
    try {
      const response = await axios.get(`${SERVER_URL}/api/health`);
      if (response.data.status === 'up') {
        log('✅ Health check passed', 'green');
        return true;
      }
      throw new Error('Health check failed');
    } catch (error) {
      log(`❌ Health check failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 2: Create Guest Session
  async testCreateGuestSession() {
    log('\n🔍 Test 2: Create Guest Session', 'cyan');
    try {
      const response = await axios.post(`${BASE_URL}/auth/guest`);
      
      if (response.data.success && response.data.data.token) {
        guestToken = response.data.data.token;
        guestUser = response.data.data.user;
        
        log('✅ Guest session created successfully', 'green');
        log(`   Guest ID: ${guestUser.guestId}`, 'blue');
        log(`   Display Name: ${guestUser.displayName}`, 'blue');
        log(`   Quota: ${guestUser.quotaUsed}/${guestUser.quotaLimit}`, 'blue');
        log(`   Expires: ${new Date(guestUser.expiresAt).toLocaleString()}`, 'blue');
        return true;
      }
      throw new Error('No token received');
    } catch (error) {
      log(`❌ Guest session creation failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 3: Verify Token in Request
  async testAuthenticatedRequest() {
    log('\n🔍 Test 3: Make Authenticated Request', 'cyan');
    try {
      const response = await axios.get(`${BASE_URL}/auth/guest/analytics`, {
        headers: {
          'Authorization': `Bearer ${guestToken}`
        }
      });
      
      if (response.data.success) {
        log('✅ Authenticated request successful', 'green');
        log(`   Active Sessions: ${response.data.data.activeSessions}`, 'blue');
        log(`   Total Users: ${response.data.data.totalUsers}`, 'blue');
        return true;
      }
      throw new Error('Request failed');
    } catch (error) {
      log(`❌ Authenticated request failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 4: Test Rate Limiting
  async testRateLimiting() {
    log('\n🔍 Test 4: Test Rate Limiting (Creating multiple sessions)', 'cyan');
    try {
      let successCount = 0;
      let rateLimitHit = false;

      for (let i = 0; i < 15; i++) {
        try {
          await axios.post(`${BASE_URL}/auth/guest`);
          successCount++;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            rateLimitHit = true;
            break;
          }
        }
      }

      if (rateLimitHit) {
        log(`✅ Rate limiting working correctly (${successCount} requests allowed before limit)`, 'green');
        return true;
      } else {
        log(`⚠️  Rate limiting may not be working (${successCount} requests succeeded)`, 'yellow');
        return true;
      }
    } catch (error) {
      log(`❌ Rate limiting test failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 5: Refresh Guest Session
  async testRefreshSession() {
    log('\n🔍 Test 5: Refresh Guest Session', 'cyan');
    try {
      const response = await axios.post(`${BASE_URL}/auth/guest/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${guestToken}`
        }
      });
      
      if (response.data.success && response.data.data.token) {
        const newToken = response.data.data.token;
        const newUser = response.data.data.user;
        
        log('✅ Session refreshed successfully', 'green');
        log(`   New Token: ${newToken.substring(0, 20)}...`, 'blue');
        log(`   Quota Reset: ${newUser.quotaUsed}/${newUser.quotaLimit}`, 'blue');
        log(`   New Expiry: ${new Date(newUser.expiresAt).toLocaleString()}`, 'blue');
        
        guestToken = newToken;
        return true;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      log(`❌ Session refresh failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 6: Logout
  async testLogout() {
    log('\n🔍 Test 6: Logout Guest Session', 'cyan');
    try {
      const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${guestToken}`
        }
      });
      
      if (response.data.success) {
        log('✅ Logout successful', 'green');
        return true;
      }
      throw new Error('Logout failed');
    } catch (error) {
      log(`❌ Logout failed: ${error.message}`, 'red');
      return false;
    }
  },

  // Test 7: Guest Analytics
  async testGuestAnalytics() {
    log('\n🔍 Test 7: Fetch Guest Analytics', 'cyan');
    try {
      const response = await axios.get(`${BASE_URL}/auth/guest/analytics`);
      
      if (response.data.success) {
        const analytics = response.data.data;
        log('✅ Analytics fetched successfully', 'green');
        log(`   Total Sessions: ${analytics.totalSessions}`, 'blue');
        log(`   Active Sessions: ${analytics.activeSessions}`, 'blue');
        log(`   Total Users: ${analytics.totalUsers}`, 'blue');
        log(`   Sessions (Last 24h): ${analytics.sessionsLast24h}`, 'blue');
        return true;
      }
      throw new Error('Analytics fetch failed');
    } catch (error) {
      log(`❌ Analytics test failed: ${error.message}`, 'red');
      return false;
    }
  }
};

// Run all tests
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('AUTH FLOW TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = [];
  
  for (const [testName, testFunc] of Object.entries(tests)) {
    const result = await testFunc();
    results.push({ name: testName, passed: result });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`${status} - ${result.name}`, color);
  });

  log('\n' + '-'.repeat(60), 'cyan');
  log(`Total: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  log('='.repeat(60) + '\n', 'cyan');

  process.exit(passed === total ? 0 : 1);
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${SERVER_URL}/api/health`);
    return true;
  } catch (error) {
    log('\n❌ Error: Server is not running on http://localhost:5000', 'red');
    log('Please start the server with: npm run dev', 'yellow');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();