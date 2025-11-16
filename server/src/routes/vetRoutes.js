const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Vet profile routes
router.post(
  '/profile',
  vetController.uploadFiles,
  vetController.createOrUpdateProfile
);
router.get('/profile', vetController.getProfile);

// Nearby vets search (public but requires auth)
router.get('/nearby', vetController.searchNearbyVets);

// Public vet profile (for farmers to view vet details)
router.get('/:vetId/public', vetController.getPublicProfile);

module.exports = router;

