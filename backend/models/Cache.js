/**
 * Cache Model (Tasks 191-192)
 * Stores API responses with automatic expiration
 */

const mongoose = require('mongoose');

/**
 * Task 191: Cache Schema
 * Stores cached API responses with key-value pairs
 */
const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique cache key (endpoint:params)'
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    description: 'Cached response data (any JSON structure)'
  },
  endpoint: {
    type: String,
    required: true,
    index: true,
    enum: ['search', 'video', 'channel', 'trending'],
    description: 'API endpoint type for analytics'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    description: 'When this cache entry expires'
  },
  hits: {
    type: Number,
    default: 0,
    description: 'Number of times this cache was used'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Task 192: TTL Index
 * MongoDB will automatically delete expired cache entries
 */
cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Compound index for analytics queries
 */
cacheSchema.index({ endpoint: 1, createdAt: -1 });

/**
 * Static method: Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<Object|null>} Cached value or null
 */
cacheSchema.statics.get = async function(key) {
  const cached = await this.findOne({
    key,
    expiresAt: { $gt: new Date() }
  });

  if (cached) {
    // Update hits and last accessed time
    await this.findByIdAndUpdate(cached._id, {
      $inc: { hits: 1 },
      lastAccessedAt: new Date()
    });

    return cached.value;
  }

  return null;
};

/**
 * Static method: Set cached value
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {string} endpoint - Endpoint type
 * @returns {Promise<Object>} Cache document
 */
cacheSchema.statics.set = async function(key, value, ttlSeconds, endpoint) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  // Upsert (update or insert)
  const cached = await this.findOneAndUpdate(
    { key },
    {
      key,
      value,
      endpoint,
      expiresAt,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      hits: 0
    },
    { upsert: true, new: true }
  );

  return cached;
};

/**
 * Static method: Invalidate cache by pattern
 * @param {string} pattern - Pattern to match (e.g., 'search:*', 'video:*')
 * @returns {Promise<number>} Number of entries deleted
 */
cacheSchema.statics.invalidate = async function(pattern) {
  const regex = new RegExp(pattern.replace('*', '.*'));
  const result = await this.deleteMany({
    key: { $regex: regex }
  });
  return result.deletedCount;
};

/**
 * Static method: Invalidate by endpoint type
 * @param {string} endpoint - Endpoint type
 * @returns {Promise<number>} Number of entries deleted
 */
cacheSchema.statics.invalidateEndpoint = async function(endpoint) {
  const result = await this.deleteMany({ endpoint });
  return result.deletedCount;
};

/**
 * Static method: Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
cacheSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({
    expiresAt: { $gt: new Date() }
  });
  const expired = total - active;

  // Get stats by endpoint
  const byEndpoint = await this.aggregate([
    { $match: { expiresAt: { $gt: new Date() } } },
    {
      $group: {
        _id: '$endpoint',
        count: { $sum: 1 },
        totalHits: { $sum: '$hits' },
        avgHits: { $avg: '$hits' }
      }
    }
  ]);

  // Calculate total hits
  const hitStats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalHits: { $sum: '$hits' },
        avgHits: { $avg: '$hits' }
      }
    }
  ]);

  return {
    total,
    active,
    expired,
    byEndpoint,
    totalHits: hitStats[0]?.totalHits || 0,
    avgHits: hitStats[0]?.avgHits || 0,
    hitRatio: active > 0 ? ((hitStats[0]?.totalHits || 0) / active).toFixed(2) : 0,
    timestamp: new Date()
  };
};

/**
 * Static method: Clean up expired cache entries manually
 * (MongoDB TTL index does this automatically, but this is for manual cleanup)
 * @returns {Promise<number>} Number of entries deleted
 */
cacheSchema.statics.cleanup = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

/**
 * Static method: Get most popular cached queries
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Most popular cache entries
 */
cacheSchema.statics.getPopular = async function(limit = 10) {
  return await this.find({
    expiresAt: { $gt: new Date() }
  })
    .sort({ hits: -1 })
    .limit(limit)
    .select('key endpoint hits lastAccessedAt');
};

module.exports = mongoose.model('Cache', cacheSchema);