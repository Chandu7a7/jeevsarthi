const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Super Admin Routes
router.get(
  '/super-admin/dashboard',
  protect,
  authorize('super_admin'),
  adminController.getSuperAdminDashboard
);

router.post(
  '/super-admin/create-state-admin',
  protect,
  authorize('super_admin'),
  adminController.createStateAdmin
);

router.get(
  '/super-admin/state-admins',
  protect,
  authorize('super_admin'),
  adminController.getStateAdmins
);

router.put(
  '/super-admin/state-admins/:id',
  protect,
  authorize('super_admin'),
  adminController.updateStateAdmin
);

router.delete(
  '/super-admin/state-admins/:id',
  protect,
  authorize('super_admin'),
  adminController.deleteStateAdmin
);

router.get(
  '/super-admin/national-analytics',
  protect,
  authorize('super_admin'),
  adminController.getNationalAnalytics
);

// State Admin Routes
router.get(
  '/state-admin/dashboard',
  protect,
  authorize('state_admin'),
  adminController.getStateAdminDashboard
);

router.post(
  '/state-admin/create-district-admin',
  protect,
  authorize('state_admin'),
  adminController.createDistrictAdmin
);

router.get(
  '/state-admin/district-admins',
  protect,
  authorize('state_admin'),
  adminController.getDistrictAdmins
);

router.put(
  '/state-admin/district-admins/:id',
  protect,
  authorize('state_admin'),
  adminController.updateDistrictAdmin
);

router.delete(
  '/state-admin/district-admins/:id',
  protect,
  authorize('state_admin'),
  adminController.deleteDistrictAdmin
);

router.get(
  '/state-admin/analytics',
  protect,
  authorize('state_admin'),
  adminController.getStateAnalytics
);

// District Admin Routes
router.get(
  '/district-admin/dashboard',
  protect,
  authorize('district_admin'),
  adminController.getDistrictAdminDashboard
);

router.get(
  '/district-admin/analytics',
  protect,
  authorize('district_admin'),
  adminController.getDistrictAnalytics
);

router.get(
  '/district-admin/treatment-logs',
  protect,
  authorize('district_admin'),
  adminController.getTreatmentLogs
);

// Shared Admin Routes (accessible by all admin levels)
router.get(
  '/farms',
  protect,
  authorize('super_admin', 'state_admin', 'district_admin'),
  adminController.getFarmsList
);

router.get(
  '/veterinarians',
  protect,
  authorize('super_admin', 'state_admin', 'district_admin'),
  adminController.getVeterinariansList
);

router.get(
  '/labs',
  protect,
  authorize('super_admin', 'state_admin', 'district_admin'),
  adminController.getLabsList
);

router.get(
  '/alerts',
  protect,
  authorize('super_admin', 'state_admin', 'district_admin'),
  adminController.getAIAlerts
);

router.get(
  '/blockchain-logs',
  protect,
  authorize('super_admin', 'state_admin', 'district_admin'),
  adminController.getBlockchainLogs
);

module.exports = router;

