const AnalyticsEvent = require('../models/AnalyticsEvent');

/**
 * Utility to track business intelligence clickstream and funnel events
 * @param {Object} req - Express request object
 * @param {string} eventType - Type of analytics event
 * @param {Object} metadata - Context metadata (e.g. productId, search query, coupon)
 */
const trackEvent = async (req, eventType, metadata = {}) => {
    try {
        const userId = req && req.user ? req.user._id : null;
        const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '';
        const userAgent = req ? (req.headers['user-agent'] || '') : '';

        await AnalyticsEvent.create({
            user: userId,
            eventType,
            metadata,
            ip,
            userAgent
        });
    } catch (err) {
        console.error('Failed to log analytics event:', err.message);
    }
};

module.exports = { trackEvent };
