const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT Token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_elegance_2026');

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found, token invalid' });
            }

            if (!user.isActive) {
                return res.status(403).json({ success: false, message: 'Account has been deactivated' });
            }

            req.user = user;
            return next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
            }
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

// Admin middleware - Check if user role is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }
};

// Optional auth — attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_elegance_2026');
            req.user = await User.findById(decoded.id).select('-password');
        } catch {
            // Silently fail — user just won't be attached
        }
    }
    next();
};

module.exports = { protect, admin, optionalAuth };
