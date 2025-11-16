const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { FARMER } = require('../constants/roles');

router.use(protect);
router.use(authorize(FARMER));

router.post('/animals', farmerController.registerAnimal);
router.get('/animals', farmerController.getAnimals);
router.get('/dashboard', farmerController.getDashboard);
router.get('/alerts', farmerController.getAlerts);
router.put('/alerts/:id/read', farmerController.markAlertAsRead);
router.get('/profile', farmerController.getProfile);
router.put('/profile', farmerController.updateProfile);
router.get('/mrl-overview', farmerController.getMRLOverview);

module.exports = router;

