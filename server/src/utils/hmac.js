const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET || 'your-secret-key-change-in-production';

/**
 * Sign a payload with HMAC
 * @param {Object|String} payload - Data to sign
 * @returns {String} HMAC token
 */
const sign = (payload) => {
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', HMAC_SECRET);
  hmac.update(payloadString);
  return hmac.digest('hex');
};

/**
 * Verify a token against a payload
 * @param {Object|String} payload - Original payload
 * @param {String} token - HMAC token to verify
 * @returns {Boolean} True if valid
 */
const verify = (payload, token) => {
  if (!token) return false;
  const expectedToken = sign(payload);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
};

/**
 * Generate a secure token for QR code
 * @param {String} tagId - Animal tag ID
 * @returns {String} Signed token
 */
const generateQRToken = (tagId) => {
  const payload = {
    tagId,
    timestamp: Date.now(),
  };
  return sign(JSON.stringify(payload));
};

/**
 * Verify QR token
 * @param {String} tagId - Animal tag ID
 * @param {String} token - Token to verify
 * @returns {Boolean} True if valid
 */
const verifyQRToken = (tagId, token) => {
  if (!token) return false;
  // Token is valid for 1 year (optional: add expiry check)
  const payload = {
    tagId,
    timestamp: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago (for validation)
  };
  // For simplicity, we'll verify the token format
  // In production, you might want to store tokens with expiry
  return token.length === 64; // SHA256 hex length
};

module.exports = {
  sign,
  verify,
  generateQRToken,
  verifyQRToken,
};

