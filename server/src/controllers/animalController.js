const Animal = require('../models/Animal');
const Treatment = require('../models/Treatment');
const { SUCCESS, NOT_FOUND } = require('../constants/statusCodes');
const { verifyQRToken } = require('../utils/hmac');

/**
 * Mask sensitive farmer data
 * @param {Object} animal - Animal object with populated farmerId
 * @returns {Object} Sanitized animal object
 */
const maskFarmerData = (animal) => {
  if (!animal.farmerId) return animal;
  
  const sanitized = { ...animal.toObject ? animal.toObject() : animal };
  
  if (sanitized.farmerId && typeof sanitized.farmerId === 'object') {
    // Mask phone number (show only last 4 digits)
    if (sanitized.farmerId.phone) {
      const phone = sanitized.farmerId.phone;
      sanitized.farmerId.phone = phone.length > 4 
        ? '****' + phone.slice(-4) 
        : '****';
    }
    
    // Remove sensitive fields
    delete sanitized.farmerId.password;
    delete sanitized.farmerId.resetPasswordToken;
    delete sanitized.farmerId.resetPasswordExpire;
    
    // Keep only essential farmer info
    sanitized.farmerId = {
      _id: sanitized.farmerId._id,
      name: sanitized.farmerId.name,
      email: sanitized.farmerId.email ? sanitized.farmerId.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined,
      phone: sanitized.farmerId.phone,
    };
  }
  
  return sanitized;
};

/**
 * @route   GET /api/animal/scan
 * @desc    Get animal by tag ID (for QR scanning)
 */
exports.getByTag = async (req, res, next) => {
  try {
    const { tagId, token } = req.query;
    const logger = require('../config/logger');

    logger.info(`QR Scan request - tagId: ${tagId}, token: ${token ? 'provided' : 'not provided'}`);

    if (!tagId) {
      logger.warn('QR Scan: Tag ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Tag ID is required',
      });
    }

    // Optional: Verify token if provided
    if (token && !verifyQRToken(tagId, token)) {
      logger.warn(`QR Scan: Invalid token for tagId: ${tagId}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const upperTagId = tagId.toUpperCase();
    logger.info(`QR Scan: Searching for animal with tagId: ${upperTagId}`);

    // Find animal by tagId or pashuAadhaarId (backward compatibility)
    const animal = await Animal.findOne({
      $or: [
        { tagId: upperTagId },
        { pashuAadhaarId: upperTagId },
      ],
      isActive: true,
    })
      .populate('farmerId', 'name email phone')
      .populate('latestTreatment')
      .lean();

    if (!animal) {
      logger.warn(`QR Scan: Animal not found for tagId: ${upperTagId}`);
      
      // Check if animal exists but is inactive
      const inactiveAnimal = await Animal.findOne({
        $or: [
          { tagId: upperTagId },
          { pashuAadhaarId: upperTagId },
        ],
      }).lean();
      
      if (inactiveAnimal) {
        logger.warn(`QR Scan: Animal found but is inactive for tagId: ${upperTagId}`);
        return res.status(403).json({
          success: false,
          message: 'Animal tag has been deactivated',
        });
      }
      
      return res.status(NOT_FOUND).json({
        success: false,
        message: 'Animal not found. Please verify the QR code is correct.',
      });
    }

    logger.info(`QR Scan: Animal found - ID: ${animal._id}, Name: ${animal.animalName || 'Unnamed'}`);

    // Sanitize response (mask sensitive data)
    const sanitizedAnimal = maskFarmerData(animal);

    // Log scan event (optional - for audit)
    // await logScanEvent(req.ip, tagId, animal._id);

    res.status(SUCCESS).json({
      success: true,
      animal: sanitizedAnimal,
    });
  } catch (error) {
    const logger = require('../config/logger');
    logger.error(`QR Scan Error: ${error.message}`, error);
    next(error);
  }
};

/**
 * @route   POST /api/animal/scan/log
 * @desc    Log scan event (for audit trail)
 */
exports.logScanEvent = async (req, res, next) => {
  try {
    const { tagId, animalId, scanType = 'qr' } = req.body;
    
    // TODO: Implement audit log storage
    // const auditLog = await AuditLog.create({
    //   tagId,
    //   animalId,
    //   scanType,
    //   scannedBy: req.user?.id,
    //   ipAddress: req.ip,
    //   timestamp: new Date(),
    // });

    res.status(SUCCESS).json({
      success: true,
      message: 'Scan event logged',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/animal/:id/deactivateTag
 * @desc    Deactivate animal tag
 */
exports.deactivateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const animal = await Animal.findById(id);
    
    if (!animal) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: 'Animal not found',
      });
    }

    // Check if user owns this animal
    if (animal.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    animal.isActive = false;
    animal.tagId = null; // Remove tag ID
    await animal.save();

    res.status(SUCCESS).json({
      success: true,
      message: 'Tag deactivated successfully',
      data: animal,
    });
  } catch (error) {
    next(error);
  }
};

