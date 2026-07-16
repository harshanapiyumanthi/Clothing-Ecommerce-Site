const ActivityLog = require('../models/ActivityLog');

/**
 * Log an admin action to the database.
 * @param {Object} req - The Express request object to extract admin user and IP.
 * @param {string} action - The action type (e.g. 'Product Deleted', 'Price Changed', 'Order Cancelled')
 * @param {string} target - The target category (e.g. 'Product', 'Order', 'Membership', 'Coupon', 'Settings')
 * @param {string} targetId - The target resource database ID
 * @param {string} details - A human-readable description of the change
 */
const logActivity = async (req, action, target, targetId, details) => {
    try {
        const adminId = req.user ? req.user._id : null;
        const adminName = req.user ? req.user.name : 'Unknown Admin';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

        if (!adminId) {
            console.warn('⚠️ Attempted to log admin action without authenticated user context');
            return;
        }

        await ActivityLog.create({
            admin: adminId,
            adminName,
            action,
            target,
            targetId: String(targetId || ''),
            details,
            ip
        });
    } catch (err) {
        console.error('❌ Failed to create activity audit log:', err.message);
    }
};

module.exports = logActivity;
