const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    verifyTransactionStatus,
    stripeWebhook,
    getPaymentHistory,
    getAllPayments,
    markCODPaid
} = require('../controllers/paymentController');

// Stripe webhook (must handle raw request body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Stripe Checkout Payment Intent / generic transactions creation
router.post('/intent', protect, createPaymentIntent);

// Verify transaction status
router.get('/verify/:transactionId', protect, verifyTransactionStatus);

// Private transaction lookup
router.get('/history', protect, getPaymentHistory);

// Admin controls
router.get('/', protect, admin, getAllPayments);
router.put('/cod/:orderId', protect, admin, markCODPaid);

module.exports = router;
