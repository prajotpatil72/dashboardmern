const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  endpoint: String,
  resultCount: Number
}, { _id: false });

const userSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['GUEST'],
    default: 'GUEST',
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  quotaUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  quotaLimit: {
    type: Number,
    default: 100,
    required: true
  },
  searchHistory: [searchHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    // No index here - TTL index defined separately below for better control
  }
}, {
  timestamps: true
});

// Virtual for checking if user is guest
userSchema.virtual('isGuest').get(function() {
  return this.userType === 'GUEST';
});

// Instance method: Check if user has quota remaining
userSchema.methods.hasQuotaRemaining = function() {
  return this.quotaUsed < this.quotaLimit;
};

// Instance method: Get quota remaining
userSchema.methods.getQuotaRemaining = function() {
  return Math.max(0, this.quotaLimit - this.quotaUsed);
};

// Static method: Cleanup expired guests
userSchema.statics.cleanupExpiredGuests = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Pre-save hook: Set expiresAt to 24h from creation if not set
userSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Compound index for analytics queries
userSchema.index({ userType: 1, createdAt: -1 });

// TTL index - MongoDB will automatically delete expired documents
// Note: This is the ONLY place we define the expiresAt index
userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);