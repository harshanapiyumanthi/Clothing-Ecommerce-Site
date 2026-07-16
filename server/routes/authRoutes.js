const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
    registerUser,
    loginUser,
    getUserProfile,
    upgradeMembership,
    forgotPassword,
    resetPassword,
    deleteAccount,
    updateCommunicationPreferences,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Strong password regex requirement
const strongPassword = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/)
    .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&.)');

router.post('/register', [
    loginLimiter,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().matches(/^\+?[0-9]{9,15}$/).withMessage('Please provide a valid phone number (9 to 15 digits)'),
    strongPassword,
    validate
], registerUser);

router.post('/login', [
    loginLimiter,
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], loginUser);

router.get('/profile', protect, getUserProfile);

router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
], forgotPassword);

router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/)
        .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&.)'),
    validate
], resetPassword);

router.post('/change-password', [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/)
        .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&.)'),
    validate
], changePassword);

router.delete('/delete-account', protect, deleteAccount);

router.put('/communication-preferences', [
    protect,
    body('email').isBoolean().withMessage('Email preference must be a boolean'),
    body('sms').isBoolean().withMessage('SMS preference must be a boolean'),
    body('whatsapp').isBoolean().withMessage('WhatsApp preference must be a boolean'),
    validate
], updateCommunicationPreferences);

router.put('/upgrade', protect, upgradeMembership);

module.exports = router;
