const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Payment = require('../models/Payment');
const stripe = require('../config/stripe');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Verify stock availability
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }
        if (product.stock < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for: ${product.name}`);
        }
    }

    let discount = 0;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.maxUsage) {
            discount = coupon.discountType === 'percentage'
                ? (orderItems.reduce((a, i) => a + i.price * i.qty, 0) * coupon.discountValue) / 100
                : coupon.discountValue;
            coupon.usedCount += 1;
            await coupon.save();
        }
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 15;
    const totalPrice = itemsPrice + shippingPrice - discount;

    const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discount,
    });

    // Update product stock and sold count
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.qty, sold: item.qty },
        });
    }

    // Clear the server-side cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Create payment record for COD
    if (paymentMethod === 'COD') {
        await Payment.create({
            user: req.user._id,
            order: order._id,
            amount: totalPrice,
            currency: 'usd',
            status: 'pending',
            paymentMethod: 'COD',
        });
    }

    res.status(201).json({ success: true, order });
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
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }
    res.json({ success: true, order });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.orderStatus = req.body.orderStatus ?? order.orderStatus;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.orderStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }
    if (req.body.orderStatus === 'Cancelled') {
        // Restore stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.qty, sold: -item.qty },
            });
        }
    }

    const updated = await order.save();
    res.json({ success: true, order: updated });
});

// @desc    Mark order as paid (e.g., after successful Stripe payment from frontend)
// @route   PUT /api/orders/:id/pay
// @access  Private
const markOrderAsPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const { id, status, update_time, email_address } = req.body;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id, status, update_time, email_address };
    order.orderStatus = 'Confirmed';

    const updated = await order.save();

    // Update payment record
    if (id) {
        await Payment.findOneAndUpdate(
            { stripePaymentIntentId: id },
            { status: 'succeeded' }
        );
    }

    res.json({ success: true, order: updated });
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
