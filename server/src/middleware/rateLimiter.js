const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for scan endpoint
 * Limits: 20 requests per 15 minutes per IP
 */
const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many scan requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  scanRateLimiter,
};

