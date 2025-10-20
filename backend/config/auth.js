module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: '24h',
  
  // User types
  userTypes: {
    GUEST: 'GUEST'
  },
  
  // Quota limits
  quotaLimits: {
    GUEST: 100 // 100 searches per day
  },
  
  // Rate limiting
  rateLimits: {
    guest: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50 // 50 requests per window
    }
  }
};