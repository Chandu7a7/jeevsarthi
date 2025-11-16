const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', treatmentController.addTreatment);
router.get('/', treatmentController.getTreatments);
router.get('/drugs/search', treatmentController.searchDrugs);
router.get('/drugs/:drugName', treatmentController.getDrugByName);

module.exports = router;

