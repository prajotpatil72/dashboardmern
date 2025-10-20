const mongoose = require('mongoose');

const guestSessionSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
  type: Date,
  required: true
  // NO index: true here
},
  metadata: {
    ipAddress: String,
    userAgent: String,
    fingerprint: String
  }
}, {
  timestamps: true
});

// TTL index for automatic cleanup
guestSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method: Cleanup expired sessions
guestSessionSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Update last activity timestamp
guestSessionSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  await this.save();
};

module.exports = mongoose.model('GuestSession', guestSessionSchema);