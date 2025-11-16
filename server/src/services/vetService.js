const VetProfile = require('../models/Vet');
const User = require('../models/User');

/**
 * Create or update vet profile
 */
const createOrUpdateProfile = async (vetId, profileData) => {
  // Check if profile exists
  let profile = await VetProfile.findOne({ vetId });

  // Validate registration number uniqueness (if updating)
  if (profileData.registrationNumber && profile) {
    const existingWithReg = await VetProfile.findOne({
      registrationNumber: profileData.registrationNumber,
      vetId: { $ne: vetId },
    });
    if (existingWithReg) {
      throw new Error('Registration number already exists');
    }
  }

  if (profile) {
    // Update existing profile
    Object.assign(profile, profileData);
    await profile.save();
    return {
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    };
  } else {
    // Create new profile
    // Check registration number uniqueness
    const existingWithReg = await VetProfile.findOne({
      registrationNumber: profileData.registrationNumber,
    });
    if (existingWithReg) {
      throw new Error('Registration number already exists');
    }

    profile = await VetProfile.create({
      ...profileData,
      vetId,
    });

    // Update User model with location if provided
    if (profileData.location && profileData.location.coordinates) {
      await User.findByIdAndUpdate(vetId, {
        location: {
          type: 'Point',
          coordinates: profileData.location.coordinates,
        },
      });
    }

    return {
      success: true,
      message: 'Profile created successfully',
      data: profile,
    };
  }
};

/**
 * Get vet profile
 */
const getProfile = async (vetId) => {
  const profile = await VetProfile.findOne({ vetId }).populate('vetId', 'name email phone avatar');

  if (!profile) {
    return {
      success: false,
      message: 'Profile not found',
    };
  }

  return {
    success: true,
    data: profile,
  };
};

/**
 * Search nearby vets
 */
const searchNearbyVets = async (lat, lng, distance = 25000, filters = {}) => {
  if (!lat || !lng) {
    throw new Error('Latitude and longitude are required');
  }

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(distance), // in meters
      },
    },
    isVerified: filters.verified !== false, // Default to verified only
  };

  // Add additional filters
  if (filters.isAvailable !== undefined) {
    // This would require checking availability schedule
    // For now, we'll use the User model's isAvailable
  }

  if (filters.languages && filters.languages.length > 0) {
    query.languages = { $in: filters.languages };
  }

  if (filters.minRating) {
    query.rating = { $gte: parseFloat(filters.minRating) };
  }

  const vets = await VetProfile.find(query)
    .populate('vetId', 'name email phone avatar isAvailable onlineStatus')
    .limit(filters.limit || 50)
    .sort({ rating: -1, ratingsCount: -1 });

  // Calculate distance for each vet
  const vetsWithDistance = vets.map((vet) => {
    if (!vet.location || !vet.location.coordinates) {
      return null;
    }

    const [vetLng, vetLat] = vet.location.coordinates;
    const distance = calculateDistance(lat, lng, vetLat, vetLng);

    return {
      ...vet.toObject(),
      distance: Math.round(distance), // in meters
      distanceKm: (distance / 1000).toFixed(2), // in kilometers
    };
  }).filter(Boolean);

  return {
    success: true,
    count: vetsWithDistance.length,
    data: vetsWithDistance,
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Update vet rating
 */
const updateRating = async (vetId, newRating) => {
  const profile = await VetProfile.findOne({ vetId });

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Calculate new average rating
  const totalRating = profile.rating * profile.ratingsCount + newRating;
  const newRatingsCount = profile.ratingsCount + 1;
  const newAverageRating = totalRating / newRatingsCount;

  profile.rating = parseFloat(newAverageRating.toFixed(2));
  profile.ratingsCount = newRatingsCount;
  await profile.save();

  return {
    success: true,
    data: profile,
  };
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  searchNearbyVets,
  updateRating,
};

