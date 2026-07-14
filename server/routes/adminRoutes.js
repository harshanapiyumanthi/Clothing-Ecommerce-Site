const express = require('express');
const router = express.Router();
const { getSalesAnalytics, getMonthlySales, getBestSellers, getCustomers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, admin, getSalesAnalytics);
router.get('/analytics/monthly', protect, admin, getMonthlySales);
router.get('/analytics/best-sellers', protect, admin, getBestSellers);
router.get('/customers', protect, admin, getCustomers);

module.exports = router;
