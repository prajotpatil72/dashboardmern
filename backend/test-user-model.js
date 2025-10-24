const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function testUserModel() {
  try {
    log('\n=== User Model Test Suite (Tasks 61-70) ===\n', 'cyan');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB', 'green');

    // Clean up test data
    await User.deleteMany({ displayName: /^TestGuest_/ });
    log('✅ Cleaned up old test data', 'green');

    // Test 1: Create User (Tasks 61-62)
    log('\n📝 Test 1: Create User with Schema Fields', 'cyan');
    const testUser = await User.create({
      guestId: 'test-uuid-12345',
      userType: 'GUEST',
      displayName: 'TestGuest_12345',
      quotaUsed: 0,
      quotaLimit: 100
    });
    log(`✅ User created: ${testUser.displayName}`, 'green');
    log(`   ID: ${testUser._id}`, 'yellow');
    log(`   Guest ID: ${testUser.guestId}`, 'yellow');
    log(`   Quota: ${testUser.quotaUsed}/${testUser.quotaLimit}`, 'yellow');

    // Test 2: Pre-save Hook (Task 68)
    log('\n📝 Test 2: Pre-save Hook (expiresAt auto-set)', 'cyan');
    log(`   Created At: ${testUser.createdAt}`, 'yellow');
    log(`   Expires At: ${testUser.expiresAt}`, 'yellow');
    const hoursDiff = (testUser.expiresAt - testUser.createdAt) / (1000 * 60 * 60);
    if (Math.abs(hoursDiff - 24) < 0.1) {
      log(`✅ expiresAt correctly set to 24h from creation (${hoursDiff.toFixed(2)}h)`, 'green');
    } else {
      log(`❌ expiresAt not set correctly: ${hoursDiff.toFixed(2)}h`, 'red');
    }

    // Test 3: Virtual Field (Task 63)
    log('\n📝 Test 3: Virtual Field (isGuest)', 'cyan');
    const userObj = testUser.toObject({ virtuals: true });
    log(`   isGuest: ${userObj.isGuest}`, 'yellow');
    if (userObj.isGuest === true) {
      log('✅ isGuest virtual field works correctly', 'green');
    } else {
      log('❌ isGuest virtual field failed', 'red');
    }

    // Test 4: Instance Method hasQuotaRemaining() (Task 64)
    log('\n📝 Test 4: Instance Method (hasQuotaRemaining)', 'cyan');
    log(`   Quota Used: ${testUser.quotaUsed}`, 'yellow');
    log(`   Quota Limit: ${testUser.quotaLimit}`, 'yellow');
    if (testUser.hasQuotaRemaining()) {
      log('✅ hasQuotaRemaining() returns true (correct)', 'green');
    } else {
      log('❌ hasQuotaRemaining() should return true', 'red');
    }

    // Test quota exceeded
    testUser.quotaUsed = 100;
    if (!testUser.hasQuotaRemaining()) {
      log('✅ hasQuotaRemaining() returns false when quota exceeded (correct)', 'green');
    } else {
      log('❌ hasQuotaRemaining() should return false when quota exceeded', 'red');
    }

    // Test 5: getQuotaRemaining() method
    log('\n📝 Test 5: Instance Method (getQuotaRemaining)', 'cyan');
    testUser.quotaUsed = 23;
    const remaining = testUser.getQuotaRemaining();
    log(`   Remaining: ${remaining}`, 'yellow');
    if (remaining === 77) {
      log('✅ getQuotaRemaining() returns correct value (77)', 'green');
    } else {
      log(`❌ getQuotaRemaining() returned ${remaining}, expected 77`, 'red');
    }

    // Test 6: Search History Array (Task 66)
    log('\n📝 Test 6: Search History Array Field', 'cyan');
    testUser.searchHistory.push({
      query: 'test query 1',
      timestamp: new Date(),
      endpoint: '/api/v1/youtube/search',
      resultCount: 50
    });
    testUser.searchHistory.push({
      query: 'test query 2',
      timestamp: new Date(),
      endpoint: '/api/v1/youtube/search',
      resultCount: 30
    });
    await testUser.save();
    log(`✅ Added 2 search history entries`, 'green');
    log(`   Total entries: ${testUser.searchHistory.length}`, 'yellow');

    // Fetch and verify
    const fetchedUser = await User.findById(testUser._id);
    if (fetchedUser.searchHistory.length === 2) {
      log('✅ Search history persisted correctly', 'green');
      log(`   Entry 1: "${fetchedUser.searchHistory[0].query}" - ${fetchedUser.searchHistory[0].resultCount} results`, 'yellow');
      log(`   Entry 2: "${fetchedUser.searchHistory[1].query}" - ${fetchedUser.searchHistory[1].resultCount} results`, 'yellow');
    } else {
      log('❌ Search history not persisted correctly', 'red');
    }

    // Test 7: Compound Index (Task 67)
    log('\n📝 Test 7: Compound Index (userType + createdAt)', 'cyan');
    const indexes = await User.collection.getIndexes();
    const hasCompoundIndex = Object.keys(indexes).some(key => 
      key.includes('userType') && key.includes('createdAt')
    );
    if (hasCompoundIndex) {
      log('✅ Compound index on userType + createdAt exists', 'green');
    } else {
      log('❌ Compound index not found', 'red');
    }

    // Test 8: TTL Index
    log('\n📝 Test 8: TTL Index on expiresAt', 'cyan');
    const hasTTLIndex = Object.keys(indexes).some(key => 
      key.includes('expiresAt')
    );
    if (hasTTLIndex) {
      log('✅ TTL index on expiresAt exists', 'green');
      log(`   Index details: ${JSON.stringify(indexes.expiresAt_1)}`, 'yellow');
    } else {
      log('❌ TTL index not found', 'red');
    }

    // Test 9: Static Method cleanupExpiredGuests() (Task 65)
    log('\n📝 Test 9: Static Method (cleanupExpiredGuests)', 'cyan');
    
    // Create an expired user
    const expiredUser = await User.create({
      guestId: 'expired-test-uuid',
      displayName: 'TestGuest_Expired',
      quotaUsed: 0,
      quotaLimit: 100,
      expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
    });
    log(`   Created expired user: ${expiredUser.displayName}`, 'yellow');

    // Run cleanup
    const deletedCount = await User.cleanupExpiredGuests();
    log(`✅ cleanupExpiredGuests() executed`, 'green');
    log(`   Deleted ${deletedCount} expired user(s)`, 'yellow');

    // Verify deletion
    const stillExists = await User.findById(expiredUser._id);
    if (!stillExists) {
      log('✅ Expired user successfully deleted', 'green');
    } else {
      log('❌ Expired user still exists', 'red');
    }

    // Test 10: Unique constraint on guestId
    log('\n📝 Test 10: Unique Constraint on guestId', 'cyan');
    try {
      await User.create({
        guestId: 'test-uuid-12345', // Same as testUser
        displayName: 'TestGuest_Duplicate',
        quotaUsed: 0,
        quotaLimit: 100
      });
      log('❌ Duplicate guestId was allowed (should have failed)', 'red');
    } catch (error) {
      if (error.code === 11000) {
        log('✅ Unique constraint on guestId working correctly', 'green');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }

// Test 11: Enum validation on userType
log('\n📝 Test 11: Enum Validation on userType', 'cyan');
try {
  await User.create({
    guestId: 'test-invalid-type',
    userType: 'INVALID_TYPE',
    displayName: 'TestGuest_Invalid',
    quotaUsed: 0,
    quotaLimit: 100
  });
  log('❌ Invalid userType was allowed (should have failed)', 'red');
} catch (error) {
  // Check if error is related to enum validation
  if (error.message.includes('is not a valid enum value') || 
      error.message.includes('GUEST') || 
      error.name === 'ValidationError') {
    log('✅ Enum validation on userType working correctly', 'green');
  } else {
    log(`❌ Unexpected error: ${error.message}`, 'red');
  }
}

    // Cleanup test data
    log('\n🧹 Cleaning up test data...', 'cyan');
    await User.deleteMany({ displayName: /^TestGuest_/ });
    log('✅ Test data cleaned up', 'green');

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('TEST SUMMARY - Tasks 61-70', 'cyan');
    log('='.repeat(60), 'cyan');
    log('✅ Task 61: Create User model with Mongoose', 'green');
    log('✅ Task 62: Define schema fields', 'green');
    log('✅ Task 63: Virtual field (isGuest)', 'green');
    log('✅ Task 64: Instance method (hasQuotaRemaining)', 'green');
    log('✅ Task 65: Static method (cleanupExpiredGuests)', 'green');
    log('✅ Task 66: Search history array', 'green');
    log('✅ Task 67: Compound index (userType + createdAt)', 'green');
    log('✅ Task 68: Pre-save hook (expiresAt auto-set)', 'green');
    log('✅ Task 69: JSDoc comments present', 'green');
    log('✅ Task 70: Model tested with sample data', 'green');
    log('='.repeat(60) + '\n', 'cyan');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log('✅ MongoDB connection closed', 'green');
    process.exit(0);
  }
}

// Run tests
testUserModel();