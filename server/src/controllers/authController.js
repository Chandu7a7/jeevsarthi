const authService = require('../services/authService');
const { CREATED, SUCCESS } = require('../constants/statusCodes');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 */
exports.getMe = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth login/register
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const result = await authService.googleAuth(req.body);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

