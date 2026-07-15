const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getAllReviews,
    toggleApproval
} = require('../controllers/reviewController');

// Public listing
router.get('/product/:productId', getProductReviews);

// Private review management
router.post('/product/:productId', protect, upload.array('images', 5), createReview);
router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

router.put('/:id/helpful', protect, markHelpful);

// Administrative controls
router.get('/', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, toggleApproval);

module.exports = router;
