const express = require('express');
const router = express.Router();
const { 
    trackInteraction,
    getRecommendations,
    getSimilarProducts,
    getBoughtTogether,
    getAssignedRecommendations,
    saveAssignedRecommendations,
    getAllAdminRecommendations
} = require('../controllers/recommendationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/track', protect, trackInteraction);
router.get('/', protect, getRecommendations);
router.get('/similar/:productId', getSimilarProducts);
router.get('/bought-together/:productId', getBoughtTogether);

// Assigned accessories for a product
router.get('/assigned/:productId', getAssignedRecommendations);

// Admin endpoints for managing recommendations
router.get('/admin', protect, admin, getAllAdminRecommendations);
router.put('/admin/:productId', protect, admin, saveAssignedRecommendations);

module.exports = router;
