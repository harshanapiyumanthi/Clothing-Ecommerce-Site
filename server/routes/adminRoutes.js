const express = require('express');
const router = express.Router();
const {
    getSalesAnalytics,
    getMonthlySales,
    getBestSellers,
    getCategoryAnalytics,
    getRevenueByDateRange,
    getCustomers,
    getCustomerById,
    exportSalesReport
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, admin, getSalesAnalytics);
router.get('/analytics/monthly', protect, admin, getMonthlySales);
router.get('/analytics/best-sellers', protect, admin, getBestSellers);
router.get('/analytics/category', protect, admin, getCategoryAnalytics);
router.get('/analytics/revenue', protect, admin, getRevenueByDateRange);
router.get('/customers', protect, admin, getCustomers);
router.get('/customers/:id', protect, admin, getCustomerById);
router.get('/reports/export', protect, admin, exportSalesReport);

module.exports = router;
