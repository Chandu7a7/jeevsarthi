const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { LAB } = require('../constants/roles');

router.use(protect);
router.use(authorize(LAB));

router.post('/tests', labController.uploadTestResult);
router.get('/tests', labController.getLabTests);
router.get('/dashboard', labController.getDashboard);

module.exports = router;

