const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Animal = require('../models/Animal');

/**
 * Find nearby veterinarians within radius
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @param {Number} maxDistance - Maximum distance in meters (default: 25000 = 25km)
 * @returns {Array} - Array of nearby vets with distance
 */
const findNearbyVets = async (lat, lng, maxDistance = 25000) => {
  try {
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return {
        success: false,
        message: 'Invalid coordinates provided',
        data: [],
        count: 0,
      };
    }

    console.log(`Searching for vets near: ${lat}, ${lng} within ${maxDistance}m`);

    // First, try with GeoJSON query (requires 2dsphere index)
    let vets = [];
    try {
      vets = await User.find({
        role: 'vet',
        isAvailable: { $ne: false }, // Allow true or undefined, but not false
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat], // MongoDB uses [lng, lat]
            },
            $maxDistance: maxDistance,
          },
        },
      }).select('name email phone location avatar isAvailable onlineStatus');
    } catch (geoError) {
      console.error('GeoJSON query failed, trying fallback:', geoError.message);
      
      // Fallback: Get all vets with location and calculate distance manually
      const allVets = await User.find({
        role: 'vet',
        isAvailable: { $ne: false },
        'location.coordinates': { $exists: true, $ne: null },
        'location.type': 'Point',
      }).select('name email phone location avatar isAvailable onlineStatus');

      // Filter by distance manually
      vets = allVets.filter((vet) => {
        if (!vet.location || !vet.location.coordinates || vet.location.coordinates.length !== 2) {
          return false;
        }
        const distance = calculateDistance(
          lat,
          lng,
          vet.location.coordinates[1], // latitude
          vet.location.coordinates[0] // longitude
        );
        return distance <= maxDistance;
      });
    }

    console.log(`Found ${vets.length} vets with location`);

    // Calculate distance for each vet
    const vetsWithDistance = vets
      .map((vet) => {
        if (!vet.location || !vet.location.coordinates || vet.location.coordinates.length !== 2) {
          return null;
        }

        const distance = calculateDistance(
          lat,
          lng,
          vet.location.coordinates[1], // latitude
          vet.location.coordinates[0] // longitude
        );

        return {
          _id: vet._id,
          name: vet.name,
          email: vet.email,
          phone: vet.phone,
          avatar: vet.avatar,
          isAvailable: vet.isAvailable !== false,
          onlineStatus: vet.onlineStatus === true,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          distanceKm: Math.round((distance / 1000) * 100) / 100, // Distance in km
        };
      })
      .filter(Boolean); // Remove null values

    console.log(`Returning ${vetsWithDistance.length} vets within ${maxDistance / 1000}km`);

    return {
      success: true,
      data: vetsWithDistance,
      count: vetsWithDistance.length,
    };
  } catch (error) {
    console.error('Error finding nearby vets:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: 'Error finding nearby veterinarians',
      error: error.message,
      data: [],
      count: 0,
    };
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} - Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Create consultation request
 * @param {String} farmerId - Farmer's user ID
 * @param {String} symptom - Symptom description
 * @param {String} mobileNumber - Farmer's mobile number
 * @param {Object} location - {lat, lng}
 * @param {String} animalId - Optional animal ID
 * @param {Number} radius - Search radius in meters
 * @returns {Object} - Created consultation
 */
const createConsultation = async (farmerId, symptom, mobileNumber, location, animalId = null, radius = 25000) => {
  try {
    const consultation = await Consultation.create({
      farmerId,
      animalId,
      symptom,
      mobileNumber,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      status: 'pending',
      radius,
    });

    // Populate farmer details
    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('farmerId', 'name email phone avatar')
      .populate('animalId', 'animalName species breed pashuAadhaarId');
    
    return {
      success: true,
      data: populatedConsultation,
      message: 'Consultation request created successfully',
    };

  } catch (error) {
    console.error('Error creating consultation:', error);
    return {
      success: false,
      message: 'Error creating consultation request',
      error: error.message,
    };
  }
};

/**
 * Vet accepts consultation
 * @param {String} consultationId - Consultation ID
 * @param {String} vetId - Veterinarian's user ID
 * @returns {Object} - Updated consultation
 */
const acceptConsultation = async (consultationId, vetId) => {
  try {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return {
        success: false,
        message: 'Consultation not found',
      };
    }

    if (consultation.status !== 'pending') {
      return {
        success: false,
        message: `Consultation is already ${consultation.status}`,
      };
    }

    // Update consultation
    consultation.vetId = vetId;
    consultation.status = 'active';
    consultation.acceptedAt = new Date();
    await consultation.save();

    // Populate vet and farmer details
    await consultation.populate('vetId', 'name email phone avatar');
    await consultation.populate('farmerId', 'name email phone avatar');

    return {
      success: true,
      data: consultation,
      message: 'Consultation accepted successfully',
    };
  } catch (error) {
    console.error('Error accepting consultation:', error);
    return {
      success: false,
      message: 'Error accepting consultation',
      error: error.message,
    };
  }
};

/**
 * Get consultation by ID
 * @param {String} consultationId - Consultation ID
 * @returns {Object} - Consultation details
 */
const getConsultationById = async (consultationId) => {
  try {
    const consultation = await Consultation.findById(consultationId)
      .populate('farmerId', 'name email phone avatar')
      .populate('vetId', 'name email phone avatar location')
      .populate('animalId', 'animalName species breed pashuAadhaarId');

    if (!consultation) {
      return {
        success: false,
        message: 'Consultation not found',
      };
    }

    return {
      success: true,
      data: consultation,
    };
  } catch (error) {
    console.error('Error getting consultation:', error);
    return {
      success: false,
      message: 'Error fetching consultation',
      error: error.message,
    };
  }
};

/**
 * Get consultations for farmer
 * @param {String} farmerId - Farmer's user ID
 * @returns {Array} - List of consultations
 */
const getFarmerConsultations = async (farmerId) => {
  try {
    const consultations = await Consultation.find({ farmerId })
      .populate('vetId', 'name email phone avatar')
      .populate('animalId', 'animalName species breed')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: consultations,
    };
  } catch (error) {
    console.error('Error getting farmer consultations:', error);
    return {
      success: false,
      message: 'Error fetching consultations',
      error: error.message,
    };
  }
};

/**
 * Get consultations for vet
 * @param {String} vetId - Veterinarian's user ID
 * @returns {Array} - List of consultations
 */
const getVetConsultations = async (vetId) => {
  try {
    const consultations = await Consultation.find({ vetId })
      .populate('farmerId', 'name email phone avatar')
      .populate('animalId', 'animalName species breed')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: consultations,
    };
  } catch (error) {
    console.error('Error getting vet consultations:', error);
    return {
      success: false,
      message: 'Error fetching consultations',
      error: error.message,
    };
  }
};

/**
 * Update consultation status
 * @param {String} consultationId - Consultation ID
 * @param {String} status - New status
 * @returns {Object} - Updated consultation
 */
const updateConsultationStatus = async (consultationId, status) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        status,
        closedAt: status === 'closed' ? new Date() : consultation.closedAt,
      },
      { new: true }
    )
      .populate('farmerId', 'name email phone avatar')
      .populate('vetId', 'name email phone avatar');

    if (!consultation) {
      return {
        success: false,
        message: 'Consultation not found',
      };
    }

    return {
      success: true,
      data: consultation,
    };
  } catch (error) {
    console.error('Error updating consultation status:', error);
    return {
      success: false,
      message: 'Error updating consultation',
      error: error.message,
    };
  }
};

module.exports = {
  findNearbyVets,
  createConsultation,
  acceptConsultation,
  getConsultationById,
  getFarmerConsultations,
  getVetConsultations,
  updateConsultationStatus,
  calculateDistance,
};

