const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UNAUTHORIZED } = require('../constants/statusCodes');
const { UNAUTHORIZED: UNAUTH_MSG, TOKEN_EXPIRED } = require('../constants/messages');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(UNAUTHORIZED).json({
      success: false,
      message: UNAUTH_MSG,
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!req.user.isActive) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: TOKEN_EXPIRED,
      });
    }

    return res.status(UNAUTHORIZED).json({
      success: false,
      message: UNAUTH_MSG,
    });
  }
};

// Generate JWT Token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

