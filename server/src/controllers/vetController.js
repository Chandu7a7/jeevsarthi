const vetService = require('../services/vetService');
const VetProfile = require('../models/Vet');
const { CREATED, SUCCESS } = require('../constants/statusCodes');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/vet-profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `vet-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Middleware for handling file uploads
exports.uploadFiles = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'identityCard', maxCount: 1 },
]);

/**
 * @route   POST /api/vet/profile
 * @desc    Create or update vet profile
 */
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    const vetId = req.user.id;

    // Check if user is a vet
    if (req.user.role !== 'vet') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only veterinarians can create profiles.',
      });
    }

    // Handle file uploads
    const profileData = { ...req.body };

    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        profileData.profilePhotoUrl = `/uploads/vet-profiles/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.identityCard && req.files.identityCard[0]) {
        profileData.identityCardUrl = `/uploads/vet-profiles/${req.files.identityCard[0].filename}`;
      }
    }

    // Parse location if provided as string
    if (profileData.location && typeof profileData.location === 'string') {
      try {
        profileData.location = JSON.parse(profileData.location);
      } catch (e) {
        // If not JSON, assume it's coordinates array
        if (profileData.latitude && profileData.longitude) {
          profileData.location = {
            type: 'Point',
            coordinates: [parseFloat(profileData.longitude), parseFloat(profileData.latitude)],
          };
        }
      }
    } else if (profileData.latitude && profileData.longitude) {
      profileData.location = {
        type: 'Point',
        coordinates: [parseFloat(profileData.longitude), parseFloat(profileData.latitude)],
      };
    }

    // Parse availability if provided as string
    if (profileData.availability && typeof profileData.availability === 'string') {
      try {
        profileData.availability = JSON.parse(profileData.availability);
      } catch (e) {
        // Keep default availability
        delete profileData.availability;
      }
    }

    // Parse languages if provided as string
    if (profileData.languages && typeof profileData.languages === 'string') {
      try {
        profileData.languages = JSON.parse(profileData.languages);
      } catch (e) {
        profileData.languages = profileData.languages.split(',').map((l) => l.trim());
      }
    }

    // Parse clinicAddress if provided as string
    if (profileData.clinicAddress && typeof profileData.clinicAddress === 'string') {
      try {
        profileData.clinicAddress = JSON.parse(profileData.clinicAddress);
      } catch (e) {
        // Keep as is
      }
    }

    const result = await vetService.createOrUpdateProfile(vetId, profileData);
    res.status(result.data._id ? CREATED : SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vet/profile
 * @desc    Get vet profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const vetId = req.user.id;

    if (req.user.role !== 'vet') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only veterinarians can access this profile.',
      });
    }

    const result = await vetService.getProfile(vetId);
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
 * @route   GET /api/vet/nearby
 * @desc    Search nearby vets
 */
exports.searchNearbyVets = async (req, res, next) => {
  try {
    const { lat, lng, distance = 25000, verified, languages, minRating, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const filters = {
      verified: verified !== 'false',
      languages: languages ? (Array.isArray(languages) ? languages : [languages]) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      limit: limit ? parseInt(limit) : 50,
    };

    const result = await vetService.searchNearbyVets(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(distance),
      filters
    );

    res.status(SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/vet/:vetId/public
 * @desc    Get public vet profile (for farmers to view)
 */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { vetId } = req.params;

    const profile = await VetProfile.findOne({ vetId })
      .populate('vetId', 'name email phone avatar')
      .select('-identityCardUrl'); // Don't expose identity card

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Vet profile not found',
      });
    }

    res.status(SUCCESS).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

