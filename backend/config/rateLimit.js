/**
 * Rate Limit Configuration
 * Development: No limits
 * Production: 300 requests per 15 minutes
 */

const rateLimit = require('express-rate-limit');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Development rate limiter (disabled)
const developmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999999, // Essentially unlimited
  skip: () => true, // Skip rate limiting entirely in development
  standardHeaders: true,
  legacyHeaders: false,
});

// Production rate limiter (300 per 15 minutes)
const productionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Export the appropriate limiter
const generalRateLimiter = isProduction ? productionLimiter : developmentLimiter;

module.exports = {
  generalRateLimiter,
  developmentLimiter,
  productionLimiter
};
