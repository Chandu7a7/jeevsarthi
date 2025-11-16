const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { scanRateLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

// Public scan endpoint (rate limited)
router.get('/scan', scanRateLimiter, animalController.getByTag);

// Protected endpoints
router.use(protect);

router.post('/scan/log', animalController.logScanEvent);
router.patch('/:id/deactivateTag', animalController.deactivateTag);

module.exports = router;

