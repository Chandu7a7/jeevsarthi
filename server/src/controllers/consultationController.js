const consultationService = require('../services/consultationService');
const { SUCCESS, CREATED } = require('../constants/statusCodes');
const { emitConsultationRequest, emitConsultationAccepted, emitConsultationClosed } = require('../sockets/consultationSocket');

/**
 * @route   GET /api/consultation/vets/nearby
 * @desc    Find nearby veterinarians within radius
 */
exports.findNearbyVets = async (req, res, next) => {
  try {
    const { lat, lng, radius = 25000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude, longitude, or radius values',
      });
    }

    console.log(`[findNearbyVets] Searching for vets near ${latNum}, ${lngNum} within ${radiusNum}m`);

    const result = await consultationService.findNearbyVets(latNum, lngNum, radiusNum);

    if (result.success) {
      res.status(SUCCESS).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[findNearbyVets] Error:', error);
    next(error);
  }
};

/**
 * @route   POST /api/consultation/create
 * @desc    Create consultation request
 */
exports.createConsultation = async (req, res, next) => {
  try {
    const { symptom, mobileNumber, location, animalId, radius = 25000, selectedVetIds } = req.body;
    const farmerId = req.user.id;

    if (!symptom || !mobileNumber || !location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Symptom, mobile number, and location (lat, lng) are required',
      });
    }

    // Find nearby vets first
    const nearbyVetsResult = await consultationService.findNearbyVets(
      location.lat,
      location.lng,
      radius
    );

    if (!nearbyVetsResult.success || nearbyVetsResult.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No veterinarians found within the specified radius',
        data: [],
      });
    }

    // Filter vets if specific vets are selected
    let vetsToNotify = nearbyVetsResult.data;
    if (selectedVetIds && Array.isArray(selectedVetIds) && selectedVetIds.length > 0) {
      // Only send to selected vets - handle both string and ObjectId formats
      vetsToNotify = nearbyVetsResult.data.filter((vet) => {
        const vetIdStr = vet._id?.toString();
        return selectedVetIds.some((selectedId) => {
          const selectedIdStr = selectedId?.toString();
          return vetIdStr === selectedIdStr;
        });
      });
      
      if (vetsToNotify.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected veterinarians not found in nearby list',
        });
      }
    }

    // Create consultation
    const result = await consultationService.createConsultation(
      farmerId,
      symptom,
      mobileNumber,
      location,
      animalId,
      radius
    );

    if (result.success) {
      // Emit socket events to selected vets (or all if none selected)
      const io = req.app.get('io');
      if (io) {
        await emitConsultationRequest(io, result.data, vetsToNotify);
      }

      res.status(CREATED).json({
        ...result,
        nearbyVetsCount: vetsToNotify.length,
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/consultation/accept/:id
 * @desc    Vet accepts consultation
 */
exports.acceptConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vetId = req.user.id;

    // Check if user is a vet
    if (req.user.role !== 'vet') {
      return res.status(403).json({
        success: false,
        message: 'Only veterinarians can accept consultations',
      });
    }

    // Get consultation before accepting to check status
    const consultationBefore = await consultationService.getConsultationById(id);
    
    if (!consultationBefore.success) {
      return res.status(404).json(consultationBefore);
    }

    if (consultationBefore.data.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Consultation is already ${consultationBefore.data.status}`,
      });
    }

    // Find all vets who received this request (for notification)
    const nearbyVetsResult = await consultationService.findNearbyVets(
      consultationBefore.data.location.lat,
      consultationBefore.data.location.lng,
      consultationBefore.data.radius
    );

    const result = await consultationService.acceptConsultation(id, vetId);

    if (result.success) {
      const io = req.app.get('io');
      if (io) {
        // Notify farmer
        await emitConsultationAccepted(io, result.data);

        // Notify other vets that consultation is closed
        const otherVetIds = nearbyVetsResult.data
          .map((vet) => vet._id.toString())
          .filter((id) => id !== vetId.toString());

        if (otherVetIds.length > 0) {
          await emitConsultationClosed(io, id, vetId, otherVetIds);
        }
      }

      res.status(SUCCESS).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/consultation/:id
 * @desc    Get consultation by ID
 */
exports.getConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await consultationService.getConsultationById(id);

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
 * @route   GET /api/consultation/farmer/list
 * @desc    Get farmer's consultations
 */
exports.getFarmerConsultations = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const result = await consultationService.getFarmerConsultations(farmerId);

    if (result.success) {
      res.status(SUCCESS).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/consultation/vet/list
 * @desc    Get vet's consultations
 */
exports.getVetConsultations = async (req, res, next) => {
  try {
    const vetId = req.user.id;
    const result = await consultationService.getVetConsultations(vetId);

    if (result.success) {
      res.status(SUCCESS).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/consultation/:id/status
 * @desc    Update consultation status
 */
exports.updateConsultationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'active', 'closed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const result = await consultationService.updateConsultationStatus(id, status);

    if (result.success) {
      res.status(SUCCESS).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};

