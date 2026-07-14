const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get overall sales analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
    const totalRevenue = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email');

    res.json({
        success: true,
        stats: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalProducts,
            totalCustomers,
        },
        recentOrders,
    });
});

// @desc    Get monthly sales data
// @route   GET /api/admin/analytics/monthly
// @access  Private/Admin
const getMonthlySales = asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();

    const monthlySales = await Order.aggregate([
        {
            $match: {
                isPaid: true,
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { '_id.month': 1 } },
    ]);

    // Fill in missing months with 0
    const result = Array.from({ length: 12 }, (_, i) => {
        const found = monthlySales.find((m) => m._id.month === i + 1);
        return { month: i + 1, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    res.json({ success: true, monthlySales: result });
});

// @desc    Get best-selling products
// @route   GET /api/admin/analytics/best-sellers
// @access  Private/Admin
const getBestSellers = asyncHandler(async (req, res) => {
    const products = await Product.find()
        .sort({ sold: -1 })
        .limit(10)
        .populate('category', 'name');

    res.json({ success: true, products });
});

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: 'customer' });
    const customers = await User.find({ role: 'customer' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({ success: true, customers, page, pages: Math.ceil(total / limit), total });
});

module.exports = { getSalesAnalytics, getMonthlySales, getBestSellers, getCustomers };
