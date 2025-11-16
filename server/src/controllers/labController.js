const labService = require('../services/labService');
const { CREATED, SUCCESS } = require('../constants/statusCodes');

/**
 * @route   POST /api/lab/tests
 * @desc    Upload test result
 */
exports.uploadTestResult = async (req, res, next) => {
  try {
    const testData = {
      ...req.body,
      labOfficerId: req.user.id,
    };
    const result = await labService.uploadTestResult(testData);
    res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/lab/tests
 * @desc    Get lab tests
 */
exports.getLabTests = async (req, res, next) => {
  try {
    const result = await labService.getLabTests(req.query);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/lab/dashboard
 * @desc    Get lab dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const result = await labService.getLabDashboard(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

