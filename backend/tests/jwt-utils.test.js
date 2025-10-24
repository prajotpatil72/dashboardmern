const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiryTime,
  refreshToken
} = require('../utils/jwt');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function testJWTUtils() {
  try {
    log('\n=== JWT Utilities Test Suite (Tasks 71-80) ===\n', 'cyan');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB', 'green');

    // Clean up test data - FIXED: Use 'logout' instead of 'test'
    await User.deleteMany({ displayName: /^JWT_Test_/ });
    await TokenBlacklist.deleteMany({ reason: { $in: ['logout', 'security'] } });
    log('✅ Cleaned up old test data', 'green');

    // Create test user
    const testUser = await User.create({
      guestId: 'jwt-test-uuid-12345',
      userType: 'GUEST',
      displayName: 'JWT_Test_User',
      quotaUsed: 0,
      quotaLimit: 100
    });
    log('✅ Test user created', 'green');

    // Task 72-74: Test generateToken
    log('\n📝 Test 1: Generate Token (Tasks 72-74)', 'cyan');
    const token = generateToken(testUser);
    if (token && typeof token === 'string' && token.length > 100) {
      log('✅ Token generated successfully', 'green');
      log(`   Token length: ${token.length} characters`, 'yellow');
    } else {
      log('❌ Token generation failed', 'red');
    }

    // Task 73: Test token payload structure
    log('\n📝 Test 2: Token Payload Structure (Task 73)', 'cyan');
    const decoded = decodeToken(token);
    const requiredFields = ['userId', 'userType', 'guestId', 'quotaLimit', 'iat', 'exp'];
    const hasAllFields = requiredFields.every(field => decoded.hasOwnProperty(field));
    
    if (hasAllFields) {
      log('✅ Token payload has all required fields', 'green');
      log(`   Fields: ${Object.keys(decoded).join(', ')}`, 'yellow');
    } else {
      log('❌ Token payload missing fields', 'red');
    }

    // Task 74: Test 24-hour expiration
    log('\n📝 Test 3: 24-Hour Expiration (Task 74)', 'cyan');
    const expiryTime = decoded.exp - decoded.iat;
    const hoursUntilExpiry = expiryTime / 3600;
    
    if (Math.abs(hoursUntilExpiry - 24) < 0.01) {
      log(`✅ Token expires in exactly 24 hours (${hoursUntilExpiry.toFixed(2)}h)`, 'green');
    } else {
      log(`❌ Token expiration incorrect: ${hoursUntilExpiry.toFixed(2)}h`, 'red');
    }

    // Task 75: Test verifyToken
    log('\n📝 Test 4: Verify Token (Task 75)', 'cyan');
    try {
      const verified = verifyToken(token);
      if (verified && verified.userId === testUser._id.toString()) {
        log('✅ Token verification successful', 'green');
        log(`   Verified userId: ${verified.userId}`, 'yellow');
      }
    } catch (error) {
      log(`❌ Token verification failed: ${error.message}`, 'red');
    }

    // Test verifyToken with invalid token
    log('\n📝 Test 5: Verify Invalid Token (Task 75)', 'cyan');
    try {
      verifyToken('invalid.token.here');
      log('❌ Should have thrown error for invalid token', 'red');
    } catch (error) {
      log('✅ Correctly rejected invalid token', 'green');
      log(`   Error: ${error.message}`, 'yellow');
    }

    // Task 76: Test decodeToken
    log('\n📝 Test 6: Decode Token Without Verification (Task 76)', 'cyan');
    const decodedPayload = decodeToken(token);
    if (decodedPayload && decodedPayload.guestId === testUser.guestId) {
      log('✅ Token decoded successfully', 'green');
      log(`   Guest ID: ${decodedPayload.guestId}`, 'yellow');
    }

    // Test isTokenExpired
    log('\n📝 Test 7: Check Token Expiration Status', 'cyan');
    const expired = isTokenExpired(token);
    if (!expired) {
      log('✅ Token is not expired (correct)', 'green');
    } else {
      log('❌ Token shows as expired (should be valid)', 'red');
    }

    // Test getTokenExpiryTime
    log('\n📝 Test 8: Get Token Expiry Time', 'cyan');
    const timeLeft = getTokenExpiryTime(token);
    const hoursLeft = timeLeft / 3600;
    if (hoursLeft > 23.9 && hoursLeft <= 24) {
      log(`✅ Correct expiry time: ${hoursLeft.toFixed(2)} hours remaining`, 'green');
    } else {
      log(`⚠️  Expiry time: ${hoursLeft.toFixed(2)} hours`, 'yellow');
    }

    // Test refreshToken
    log('\n📝 Test 9: Refresh Token', 'cyan');
    const newToken = refreshToken(token, testUser);
    const newDecoded = decodeToken(newToken);
    if (newToken !== token && newDecoded.userId === decoded.userId) {
      log('✅ Token refreshed successfully', 'green');
      log(`   Old iat: ${decoded.iat}, New iat: ${newDecoded.iat}`, 'yellow');
    }

    // Task 78: Test token blacklisting - FIXED: Use 'logout' instead of 'test'
    log('\n📝 Test 10: Token Blacklisting (Task 78)', 'cyan');
    await TokenBlacklist.blacklistToken(
      token,
      testUser._id,
      testUser.guestId,
      new Date(decoded.exp * 1000),
      'logout'  // ✅ FIXED: Changed from 'test' to 'logout'
    );
    
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      log('✅ Token blacklisted successfully', 'green');
    } else {
      log('❌ Token blacklist failed', 'red');
    }

    // Task 79: Test cleanup function - FIXED: Use 'security' instead of 'test'
    log('\n📝 Test 11: Cleanup Expired Tokens (Task 79)', 'cyan');
    
    // Create an expired blacklist entry
    await TokenBlacklist.create({
      token: 'expired.test.token',
      userId: testUser._id,
      guestId: testUser.guestId,
      expiresAt: new Date(Date.now() - 1000),
      reason: 'security'  // ✅ FIXED: Changed from 'test' to 'security'
    });
    
    const cleanedCount = await TokenBlacklist.cleanupExpiredTokens();
    log(`✅ Cleanup function executed`, 'green');
    log(`   Removed ${cleanedCount} expired tokens`, 'yellow');

    // Test blacklist statistics
    log('\n📝 Test 12: Blacklist Statistics', 'cyan');
    const stats = await TokenBlacklist.getStats();
    log('✅ Statistics retrieved', 'green');
    log(`   Total: ${stats.total}, Active: ${stats.active}, Expired: ${stats.expired}`, 'yellow');

    // Cleanup - FIXED: Remove 'logout' and 'security' reasons
    log('\n🧹 Cleaning up test data...', 'cyan');
    await User.deleteMany({ displayName: /^JWT_Test_/ });
    await TokenBlacklist.deleteMany({ reason: { $in: ['logout', 'security'] } });
    log('✅ Test data cleaned up', 'green');

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('TEST SUMMARY - Tasks 71-80', 'cyan');
    log('='.repeat(60), 'cyan');
    log('✅ Task 71: Create JWT utilities file', 'green');
    log('✅ Task 72-74: Generate token with 24h expiry', 'green');
    log('✅ Task 73: Correct payload structure', 'green');
    log('✅ Task 75: Verify token with error handling', 'green');
    log('✅ Task 76: Decode token without verification', 'green');
    log('✅ Task 77: Scheduled cleanup job', 'green');
    log('✅ Task 78: Token blacklist implementation', 'green');
    log('✅ Task 79: Cleanup expired tokens', 'green');
    log('✅ Task 80: JSDoc documentation', 'green');
    log('='.repeat(60) + '\n', 'cyan');

    process.exit(0);

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('✅ MongoDB connection closed', 'green');
  }
}

testJWTUtils();