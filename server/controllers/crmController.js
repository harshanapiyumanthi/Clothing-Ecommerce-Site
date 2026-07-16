const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const SupportTicket = require('../models/SupportTicket');
const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const logActivity = require('../utils/activityLogger');

// @desc    Get Customer Segmentation Data
// @route   GET /api/crm/segments
// @access  Private/Admin
const getSegments = asyncHandler(async (req, res) => {
    // Generate segment counts
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const premiumUsers = await User.countDocuments({ membershipTier: 'Premium' });
    
    // Thirty days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    
    // Gold/Platinum users
    const vipUsers = await User.countDocuments({ loyaltyStatus: { $in: ['Gold', 'Platinum'] } });

    res.json({
        success: true,
        segments: {
            total: totalUsers,
            premium: premiumUsers,
            active: activeUsers,
            vip: vipUsers,
            inactive: totalUsers - activeUsers
        }
    });
});

// @desc    Get 360 Customer Profile
// @route   GET /api/crm/customers/:id
// @access  Private/Admin
const getCustomerProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    const tickets = await SupportTicket.find({ user: user._id }).sort({ createdAt: -1 });
    
    const totalSpent = orders.reduce((acc, order) => order.isPaid ? acc + order.totalPrice : acc, 0);

    res.json({
        success: true,
        profile: user,
        metrics: {
            totalOrders: orders.length,
            totalSpent,
            rewardPoints: user.rewardPoints
        },
        orders,
        tickets
    });
});

// @desc    Simulate automated campaign (e.g. Birthday, Abandoned Cart)
// @route   POST /api/crm/trigger-automation
// @access  Private/Admin
const triggerAutomation = asyncHandler(async (req, res) => {
    const { type } = req.body;
    // type: 'AbandonedCart', 'BirthdayWish', 'DiscountCampaign'
    
    // In a real environment, this runs as a cron job.
    // We are simulating it to demonstrate the architecture immediately.
    
    if (type === 'AbandonedCart') {
        // Find users with active carts (simulated here by grabbing a few random customers)
        const targets = await User.find({ role: 'customer', 'communicationPreferences.marketingOptIn': true }).limit(2);
        for (const target of targets) {
            await Notification.create({
                user: target._id,
                title: 'You left something beautiful behind!',
                message: 'Your Elegance cart is waiting. Complete your purchase now before items sell out.',
                type: 'AbandonedCart'
            });
        }
        await logActivity(req, 'Automated Campaign', 'CRM', null, 'Triggered Abandoned Cart campaign simulation.');
        return res.json({ success: true, message: `Abandoned Cart notifications sent to ${targets.length} users.` });
    }
    
    if (type === 'BirthdayWish') {
        const targets = await User.find({ role: 'customer', 'communicationPreferences.marketingOptIn': true }).limit(3);
        for (const target of targets) {
            await Notification.create({
                user: target._id,
                title: 'Happy Birthday from Elegance!',
                message: 'We wish you a wonderful birthday. Use code BDAY20 for 20% off your next order!',
                type: 'BirthdayWish'
            });
        }
        await logActivity(req, 'Automated Campaign', 'CRM', null, 'Triggered Birthday Wish campaign simulation.');
        return res.json({ success: true, message: `Birthday notifications sent to ${targets.length} users.` });
    }

    res.status(400);
    throw new Error('Unknown automation type');
});

// @desc    Update customer preferences (Client)
// @route   PUT /api/crm/my-preferences
// @access  Private
const updateMyPreferences = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { favoriteColors, favoriteCategories, favoriteSizes, favoriteStyles, communicationPreferences } = req.body;

    if (favoriteColors) user.preferences.favoriteColors = favoriteColors;
    if (favoriteCategories) user.preferences.favoriteCategories = favoriteCategories;
    if (favoriteSizes) user.preferences.favoriteSizes = favoriteSizes;
    if (favoriteStyles) user.preferences.favoriteStyles = favoriteStyles;
    
    if (communicationPreferences) {
        user.communicationPreferences = {
            ...user.communicationPreferences,
            ...communicationPreferences
        };
    }

    await user.save();
    res.json({ success: true, preferences: user.preferences, communicationPreferences: user.communicationPreferences });
});

module.exports = {
    getSegments,
    getCustomerProfile,
    triggerAutomation,
    updateMyPreferences
};
