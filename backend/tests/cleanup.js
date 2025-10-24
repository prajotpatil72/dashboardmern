const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanup() {
  console.log('🧹 Cleaning up test data before running tests...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('../models/User');
    const GuestSession = require('../models/GuestSession');
    
    // Delete test users
    const deletedUsers = await User.deleteMany({
      displayName: /^(TestGuest_|Guest_)/
    });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} test users`);
    
    // Delete old sessions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const deletedSessions = await GuestSession.deleteMany({
      createdAt: { $lt: oneHourAgo }
    });
    console.log(`✅ Deleted ${deletedSessions.deletedCount} old sessions`);
    
    await mongoose.connection.close();
    console.log('✅ Cleanup complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanup();