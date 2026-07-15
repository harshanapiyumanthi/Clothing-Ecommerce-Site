const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const {
    registerUser,
    loginUser,
    getUserProfile,
    upgradeMembership,
    forgotPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
], registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], loginUser);

router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
], forgotPassword);

router.put('/upgrade', protect, upgradeMembership);

module.exports = router;
