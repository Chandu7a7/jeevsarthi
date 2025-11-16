const crypto = require('crypto');

/**
 * Generate SHA256 hash for blockchain traceability
 * @param {Object} data - Data to hash
 * @returns {String} - SHA256 hash
 */
const generateHash = (data) => {
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Verify hash integrity
 * @param {Object} data - Original data
 * @param {String} hash - Hash to verify
 * @returns {Boolean} - True if hash matches
 */
const verifyHash = (data, hash) => {
  const generatedHash = generateHash(data);
  return generatedHash === hash;
};

module.exports = {
  generateHash,
  verifyHash,
};

