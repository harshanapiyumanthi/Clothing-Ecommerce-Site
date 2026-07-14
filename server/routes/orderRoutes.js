const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, createStripePaymentIntent, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllOrders);
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/stripe-intent', protect, createStripePaymentIntent);

module.exports = router;
