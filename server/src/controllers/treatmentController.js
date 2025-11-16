const treatmentService = require('../services/treatmentService');
const { CREATED, SUCCESS } = require('../constants/statusCodes');

/**
 * @route   POST /api/treatments
 * @desc    Add treatment
 */
exports.addTreatment = async (req, res, next) => {
  try {
    const treatmentData = {
      ...req.body,
      farmerId: req.user.id,
    };
    
    // Pass io instance to service if needed
    const io = req.app.get('io');
    const result = await treatmentService.addTreatment(treatmentData, io);
    res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/treatments
 * @desc    Get treatments
 */
exports.getTreatments = async (req, res, next) => {
  try {
    const result = await treatmentService.getTreatments(
      req.user.id,
      req.user.role,
      req.query
    );
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/treatments/drugs/search
 * @desc    Search drugs
 */
exports.searchDrugs = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    const result = await treatmentService.searchDrugs(q);
    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/treatments/drugs/:drugName
 * @desc    Get drug by name
 */
exports.getDrugByName = async (req, res, next) => {
  try {
    const { drugName } = req.params;
    const drug = await treatmentService.getDrugByName(drugName);
    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Drug not found',
      });
    }
    res.status(SUCCESS).json({
      success: true,
      data: drug,
    });
  } catch (error) {
    next(error);
  }
};

