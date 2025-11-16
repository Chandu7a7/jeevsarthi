const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public route - find nearby vets (but still requires auth)
router.get('/vets/nearby', consultationController.findNearbyVets);

// Farmer routes
router.post('/create', consultationController.createConsultation);
router.get('/farmer/list', consultationController.getFarmerConsultations);

// Vet routes
router.patch('/accept/:id', consultationController.acceptConsultation);
router.get('/vet/list', consultationController.getVetConsultations);

// Common routes
router.get('/:id', consultationController.getConsultation);
router.patch('/:id/status', consultationController.updateConsultationStatus);

module.exports = router;

