const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesReport, getUsers } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin')); // Only admins can access these routes

router.get('/dashboard-stats', getDashboardStats);
router.get('/sales-report', getSalesReport);
router.get('/users', getUsers);

module.exports = router;
