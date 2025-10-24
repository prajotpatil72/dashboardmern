const crypto = require('crypto');

/**
 * Generate a fingerprint based on IP and User-Agent
 * Used for abuse detection and tracking
 */
const generateFingerprint = (req) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Create hash of IP + User-Agent
  const hash = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex');
  
  return {
    fingerprint: hash,
    ip: ip,
    userAgent: userAgent
  };
};

/**
 * Middleware to attach fingerprint to request
 */
const fingerprintMiddleware = (req, res, next) => {
  const fingerprintData = generateFingerprint(req);
  
  req.fingerprint = fingerprintData.fingerprint;
  req.clientIp = fingerprintData.ip;
  req.clientUserAgent = fingerprintData.userAgent;
  
  next();
};

/**
 * Check if fingerprint has too many active sessions
 */
const checkFingerprintAbuse = async (fingerprint, GuestSession) => {
  const activeSessionsCount = await GuestSession.countDocuments({
    'metadata.fingerprint': fingerprint,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  
  // Allow max 5 active sessions per fingerprint
  return activeSessionsCount >= 1000;
};

module.exports = {
  generateFingerprint,
  fingerprintMiddleware,
  checkFingerprintAbuse
};