const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {String} id - User ID
 * @returns {String} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify JWT Token
 * @param {String} token - JWT Token
 * @returns {Object} - Decoded token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};

