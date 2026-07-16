const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getBIDashboard,
    getBISales,
    getBIProducts,
    getBIColorsSizesFabrics,
    getBIRecommendations,
    getBIDreamDress,
    getBIMemberships,
    getBIMarketing,
    getBICartPayments,
    getBIInventory,
    getBIFeedbackSearches,
    getBIAletrs,
    getBIDecisionSupport,
    exportBIReport,
    trackPublicEvent
} = require('../controllers/biController');

// Track public/client-side analytics events
router.post('/track-public', trackPublicEvent);

// Protected Admin BI Endpoints
router.get('/dashboard', protect, admin, getBIDashboard);
router.get('/sales', protect, admin, getBISales);
router.get('/products', protect, admin, getBIProducts);
router.get('/colors-sizes-fabrics', protect, admin, getBIColorsSizesFabrics);
router.get('/recommendations', protect, admin, getBIRecommendations);
router.get('/dream-dress', protect, admin, getBIDreamDress);
router.get('/memberships', protect, admin, getBIMemberships);
router.get('/marketing', protect, admin, getBIMarketing);
router.get('/cart-payments', protect, admin, getBICartPayments);
router.get('/inventory', protect, admin, getBIInventory);
router.get('/feedback-searches', protect, admin, getBIFeedbackSearches);
router.get('/alerts', protect, admin, getBIAletrs);
router.get('/decision-support', protect, admin, getBIDecisionSupport);
router.get('/reports/export', protect, admin, exportBIReport);

module.exports = router;
