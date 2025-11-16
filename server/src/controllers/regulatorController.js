const regulatorService = require('../services/regulatorService');
const { SUCCESS } = require('../constants/statusCodes');

/**
 * @route   GET /api/regulator/dashboard
 * @desc    Get regulator dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const result = await regulatorService.getRegulatorDashboard();
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/regulator/regions
 * @desc    Get region-wise statistics
 */
exports.getRegionStats = async (req, res, next) => {
  try {
    const result = await regulatorService.getRegionStats();
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

