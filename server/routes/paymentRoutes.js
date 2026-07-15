const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    stripeWebhook,
    getPaymentHistory,
    getAllPayments,
    markCODPaid
} = require('../controllers/paymentController');

// Stripe webhook (must handle raw request body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Stripe Checkout Payment Intent
router.post('/intent', protect, createPaymentIntent);

// Private transaction lookup
router.get('/history', protect, getPaymentHistory);

// Admin controls
router.get('/', protect, admin, getAllPayments);
router.put('/cod/:orderId', protect, admin, markCODPaid);

module.exports = router;
