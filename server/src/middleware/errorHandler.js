const logger = require('../config/logger');
const { SERVER_ERROR } = require('../constants/statusCodes');
const { SERVER_ERROR: SERVER_ERR_MSG } = require('../constants/messages');

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Authentication errors - check for common auth error messages
  if (err.message && (
    err.message.includes('Invalid email or password') ||
    err.message.includes('Invalid credentials') ||
    err.message.includes('Unauthorized') ||
    err.message.includes('Token expired') ||
    err.message.includes('User not found')
  )) {
    error.statusCode = 401;
  }

  // User account errors
  if (err.message && (
    err.message.includes('User already exists') ||
    err.message.includes('deactivated') ||
    err.message.includes('cannot be registered')
  )) {
    error.statusCode = error.statusCode || 400;
  }

  res.status(error.statusCode || SERVER_ERROR).json({
    success: false,
    message: error.message || SERVER_ERR_MSG,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

