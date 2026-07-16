const asyncHandler = require('express-async-handler');
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const PaymentFactory = require('../services/payments/PaymentFactory');
const logActivity = require('../utils/activityLogger');

// @desc    Create generic payment transaction
// @route   POST /api/payments/intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount, orderId, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Invalid payment amount');
    }

    const method = paymentMethod || 'Stripe';
    try {
        const provider = PaymentFactory.getProvider(method);
        const transaction = await provider.createTransaction(req.user, amount, orderId);

        res.json(transaction);
    } catch (error) {
        console.error(`Payment creation failed for ${method}:`, error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Verify transaction status
// @route   GET /api/payments/verify/:transactionId
// @access  Private
const verifyTransactionStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { method } = req.query;

    if (!method) {
        res.status(400);
        throw new Error('Payment method query parameter is required');
    }

    try {
        const provider = PaymentFactory.getProvider(method);
        const verification = await provider.verifyTransaction(transactionId);

        // Update the database records on success
        if (verification.status === 'succeeded') {
            const payment = await Payment.findOneAndUpdate(
                { stripePaymentIntentId: transactionId },
                { status: 'succeeded' },
                { new: true }
            );

            if (payment && payment.order) {
                await Order.findByIdAndUpdate(payment.order, {
                    isPaid: true,
                    paidAt: new Date(),
                    'paymentResult.id': transactionId,
                    'paymentResult.status': 'succeeded',
                    'paymentResult.update_time': new Date().toISOString(),
                    orderStatus: 'Confirmed',
                });
            }
        }

        res.json({ success: true, ...verification });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe sends raw body)
const stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const payload = req.rawBody || req.body;
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature error:', err.message);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const intent = event.data.object;
            const payment = await Payment.findOneAndUpdate(
                { stripePaymentIntentId: intent.id },
                {
                    status: 'succeeded',
                    paymentMethodDetails: {
                        brand: intent.payment_method_details?.card?.brand,
                        last4: intent.payment_method_details?.card?.last4,
                        expMonth: intent.payment_method_details?.card?.exp_month,
                        expYear: intent.payment_method_details?.card?.exp_year,
                    },
                    receiptUrl: intent.charges?.data[0]?.receipt_url,
                },
                { new: true }
            );

            // Mark the associated order as paid
            if (payment?.order) {
                await Order.findByIdAndUpdate(payment.order, {
                    isPaid: true,
                    paidAt: new Date(),
                    'paymentResult.id': intent.id,
                    'paymentResult.status': intent.status,
                    'paymentResult.update_time': new Date().toISOString(),
                    orderStatus: 'Confirmed',
                });
            }
            break;
        }
        case 'payment_intent.payment_failed': {
            const intent = event.data.object;
            await Payment.findOneAndUpdate(
                { stripePaymentIntentId: intent.id },
                {
                    status: 'failed',
                    failureReason: intent.last_payment_error?.message,
                }
            );
            break;
        }
        case 'charge.refunded': {
            const charge = event.data.object;
            const payment = await Payment.findOneAndUpdate(
                { stripePaymentIntentId: charge.payment_intent },
                { status: 'refunded', refundedAt: new Date() }
            );
            // Log refund to audit log
            if (payment && req) {
                await logActivity(req, 'Refund Processed', 'Payment', payment._id, `Refund processed for payment transaction ${charge.payment_intent}.`);
            }
            break;
        }
        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
});

// @desc    Get current user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments({ user: req.user._id });
    const payments = await Payment.find({ user: req.user._id })
        .populate('order', 'orderStatus totalPrice createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({ success: true, payments, page, pages: Math.ceil(total / limit), total });
});

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Admin
const getAllPayments = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.method) query.paymentMethod = req.query.method;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
        .populate('user', 'name email')
        .populate('order', 'orderStatus totalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Revenue summary
    const revenue = await Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
        success: true,
        payments,
        page,
        pages: Math.ceil(total / limit),
        total,
        totalRevenue: revenue[0]?.total || 0,
    });
});

// @desc    Mark COD order as paid (Admin)
// @route   PUT /api/payments/cod/:orderId
// @access  Admin
const markCODPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.paymentMethod !== 'COD') {
        res.status(400);
        throw new Error('This is not a COD order');
    }

    // Create payment record
    const payment = await Payment.create({
        user: order.user,
        order: order._id,
        amount: order.totalPrice,
        currency: 'usd',
        status: 'succeeded',
        paymentMethod: 'COD',
    });

    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'Confirmed';
    await order.save();

    // Log administrative action
    await logActivity(req, 'COD Order Marked Paid', 'Order', order._id, `Marked COD Order #${order._id} as fully paid.`);

    res.json({ success: true, payment, order });
});

module.exports = {
    createPaymentIntent,
    verifyTransactionStatus,
    stripeWebhook,
    getPaymentHistory,
    getAllPayments,
    markCODPaid,
};
