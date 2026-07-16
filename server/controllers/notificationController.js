const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    // Support filtering by read/unread
    if (req.query.isRead !== undefined) {
        query.isRead = req.query.isRead === 'true';
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        notifications,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, count });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this notification');
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
