const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const stripe = require('../config/stripe');
const orderService = require('../services/orderService');
const logActivity = require('../utils/activityLogger');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body, req.user);
        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.status) query.orderStatus = req.query.status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone').lean();
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    // Allow only the order owner or admin
    const isAdmin = ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support', 'inventory_manager', 'marketing_manager', 'designer'].includes(req.user.role);
    if (order.user._id.toString() !== req.user._id.toString() && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }
    res.json({ success: true, order });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus, trackingNumber } = req.body;
    try {
        const { order, oldStatus } = await orderService.updateOrderStatus(req.params.id, orderStatus, trackingNumber);

        if (orderStatus === 'Cancelled') {
            await logActivity(req, 'Order Cancelled', 'Order', order._id, `Order #${order._id} cancelled`);
        } else {
            await logActivity(req, 'Order Updated', 'Order', order._id, `Changed status of order #${order._id} from "${oldStatus}" to "${orderStatus}"`);
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const markOrderAsPaid = asyncHandler(async (req, res) => {
    const isAdmin = ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support', 'inventory_manager', 'marketing_manager', 'designer'].includes(req.user.role);
    try {
        const order = await orderService.markOrderAsPaid(req.params.id, req.body, req.user, isAdmin);
        res.json({ success: true, order });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Create Stripe payment intent
// @route   POST /api/orders/stripe-intent
// @access  Private
const createStripePaymentIntent = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Invalid amount');
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: { userId: req.user._id.toString() },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.orderStatus = req.query.status;
    if (req.query.isPaid) query.isPaid = req.query.isPaid === 'true';
    if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    markOrderAsPaid,
    createStripePaymentIntent,
    getAllOrders,
};
