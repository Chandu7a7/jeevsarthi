const farmerService = require('../services/farmerService');
const { CREATED, SUCCESS } = require('../constants/statusCodes');

/**
 * @route   POST /api/farmer/animals
 * @desc    Register new animal
 */
exports.registerAnimal = async (req, res, next) => {
  try {
    const result = await farmerService.registerAnimal(req.user.id, req.body);
    res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/farmer/animals
 * @desc    Get farmer's animals
 */
exports.getAnimals = async (req, res, next) => {
  try {
    const result = await farmerService.getFarmerAnimals(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/farmer/dashboard
 * @desc    Get farmer dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const result = await farmerService.getFarmerDashboard(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/farmer/alerts
 * @desc    Get farmer alerts
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const result = await farmerService.getFarmerAlerts(req.user.id, req.query);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/farmer/alerts/:id/read
 * @desc    Mark alert as read
 */
exports.markAlertAsRead = async (req, res, next) => {
  try {
    const result = await farmerService.markAlertAsRead(req.params.id, req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/farmer/profile
 * @desc    Get farmer profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const result = await farmerService.getFarmerProfile(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/farmer/profile
 * @desc    Update farmer profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const result = await farmerService.updateFarmerProfile(req.user.id, req.body);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/animals/:pashuAadhaarId
 * @desc    Get animal by Pashu Aadhaar ID (public access for QR scanning)
 */
exports.getAnimalByPashuAadhaarId = async (req, res, next) => {
  try {
    const result = await farmerService.getAnimalByPashuAadhaarId(req.params.pashuAadhaarId);
    if (result.success) {
      res.status(SUCCESS).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/farmer/mrl-overview
 * @desc    Get MRL Usage Overview
 */
exports.getMRLOverview = async (req, res, next) => {
  try {
    const result = await farmerService.getMRLOverview(req.user.id);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

