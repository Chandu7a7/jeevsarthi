const express = require('express');
const router = express.Router();
const regulatorController = require('../controllers/regulatorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { REGULATOR } = require('../constants/roles');

router.use(protect);
router.use(authorize(REGULATOR));

router.get('/dashboard', regulatorController.getDashboard);
router.get('/regions', regulatorController.getRegionStats);

module.exports = router;

