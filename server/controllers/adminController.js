const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// @desc    Get overall sales analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
    const [revenueResult, totalOrders, totalProducts, totalCustomers, recentOrders, pendingOrders] =
        await Promise.all([
            Order.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } },
            ]),
            Order.countDocuments(),
            Product.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name email'),
            Order.countDocuments({ orderStatus: 'Pending' }),
        ]);

    // Total reviews count
    const totalReviews = await Review.countDocuments();

    // Low stock alert
    const lowStockProducts = await Product.find({ stock: { $lte: 5, $gt: 0 } })
        .select('name stock images')
        .limit(10);

    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    res.json({
        success: true,
        stats: {
            totalRevenue: revenueResult[0]?.total || 0,
            totalOrders,
            totalProducts,
            totalCustomers,
            pendingOrders,
            totalReviews,
            outOfStockCount,
        },
        recentOrders,
        lowStockProducts,
    });
});

// @desc    Get monthly sales data
// @route   GET /api/admin/analytics/monthly
// @access  Private/Admin
const getMonthlySales = asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();

    const [monthlySales, monthlyOrders] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31T23:59:59`),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalPrice' },
                },
            },
            { $sort: { '_id.month': 1 } },
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31T23:59:59`),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    newCustomers: { $addToSet: '$user' },
                },
            },
        ]),
    ]);

    const result = Array.from({ length: 12 }, (_, i) => {
        const found = monthlySales.find((m) => m._id.month === i + 1);
        return {
            month: i + 1,
            revenue: found?.revenue || 0,
            orders: found?.orders || 0,
            avgOrderValue: Math.round((found?.avgOrderValue || 0) * 100) / 100,
        };
    });

    res.json({ success: true, year, monthlySales: result });
});

// @desc    Get best-selling products
// @route   GET /api/admin/analytics/best-sellers
// @access  Private/Admin
const getBestSellers = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const products = await Product.find()
        .sort({ sold: -1 })
        .limit(limit)
        .populate('category', 'name');

    res.json({ success: true, products });
});

// @desc    Get revenue breakdown by category
// @route   GET /api/admin/analytics/category
// @access  Private/Admin
const getCategoryAnalytics = asyncHandler(async (req, res) => {
    const data = await Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: '$orderItems' },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.product',
                foreignField: '_id',
                as: 'productInfo',
            },
        },
        { $unwind: '$productInfo' },
        {
            $lookup: {
                from: 'categories',
                localField: 'productInfo.category',
                foreignField: '_id',
                as: 'categoryInfo',
            },
        },
        { $unwind: '$categoryInfo' },
        {
            $group: {
                _id: '$categoryInfo._id',
                categoryName: { $first: '$categoryInfo.name' },
                totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
                totalItemsSold: { $sum: '$orderItems.qty' },
                totalOrders: { $sum: 1 },
            },
        },
        { $sort: { totalRevenue: -1 } },
    ]);

    res.json({ success: true, data });
});

// @desc    Get revenue by date range
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
const getRevenueByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const matchQuery = { isPaid: true };
    if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const [revenue, orderStatuses] = await Promise.all([
        Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalPrice' },
                    totalDiscount: { $sum: '$discount' },
                },
            },
        ]),
        Order.aggregate([
            { $match: { createdAt: matchQuery.createdAt || { $exists: true } } },
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),
    ]);

    res.json({
        success: true,
        revenue: revenue[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalDiscount: 0 },
        orderStatuses,
    });
});

// @desc    Get all customers with pagination
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: 'customer' };
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({ success: true, customers, page, pages: Math.ceil(total / limit), total });
});

// @desc    Get single customer detail with order history
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
const getCustomerById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const [orders, totalSpent, reviewCount] = await Promise.all([
        Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
        Order.aggregate([
            { $match: { user: user._id, isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Review.countDocuments({ user: user._id }),
    ]);

    res.json({
        success: true,
        customer: user,
        stats: {
            totalOrders: orders.length,
            totalSpent: totalSpent[0]?.total || 0,
            reviewCount,
        },
        recentOrders: orders,
    });
});

// @desc    Export sales report as CSV
// @route   GET /api/admin/reports/export
// @access  Private/Admin
const exportSalesReport = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    let csvContent = 'Order ID,Customer Name,Customer Email,Total Price,Payment Method,Is Paid,Order Status,Date\n';

    orders.forEach(order => {
        const orderId = order._id.toString();
        const userName = order.user ? order.user.name.replace(/"/g, '""') : 'Guest';
        const userEmail = order.user ? order.user.email : 'N/A';
        const totalPrice = order.totalPrice;
        const paymentMethod = order.paymentMethod;
        const isPaid = order.isPaid ? 'Yes' : 'No';
        const orderStatus = order.orderStatus;
        const date = order.createdAt.toISOString();

        csvContent += `"${orderId}","${userName}","${userEmail}",${totalPrice},"${paymentMethod}","${isPaid}","${orderStatus}","${date}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.status(200).send(csvContent);
});

module.exports = {
    getSalesAnalytics,
    getMonthlySales,
    getBestSellers,
    getCategoryAnalytics,
    getRevenueByDateRange,
    getCustomers,
    getCustomerById,
    exportSalesReport,
};
