const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/activityLogger');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, phone: phone || '' });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                membershipTier: user.membershipTier,
                rewardPoints: user.rewardPoints,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if account is temporarily locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesLeft} minute(s).`
            });
        }

        if (!(await user.matchPassword(password))) {
            // Increment failed attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
                user.loginAttempts = 0; // Reset counter after lock
            }
            await user.save({ validateBeforeSave: false });

            const attemptsLeft = 5 - (user.loginAttempts || 0);
            return res.status(401).json({
                success: false,
                message: attemptsLeft > 0
                    ? `Invalid email or password. You have ${attemptsLeft} attempts remaining.`
                    : 'Account has been locked for 15 minutes.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
        }

        // Reset failed login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Log admin login to audit system
        const adminRoles = ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support', 'inventory_manager', 'marketing_manager', 'designer'];
        if (adminRoles.includes(user.role)) {
            await logActivity(req, 'Admin Login', 'User', user._id, `Admin ${user.name} logged in successfully.`);
        }

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            membershipTier: user.membershipTier,
            rewardPoints: user.rewardPoints,
            communicationPreferences: user.communicationPreferences || { email: true, sms: false, whatsapp: false },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                addresses: user.addresses,
                membershipTier: user.membershipTier,
                membershipExpiry: user.membershipExpiry,
                rewardPoints: user.rewardPoints,
                communicationPreferences: user.communicationPreferences || { email: true, sms: false, whatsapp: false },
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Upgrade to Premium Membership
// @route   PUT /api/auth/upgrade
// @access  Private
const upgradeMembership = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.membershipTier = 'Premium';
        user.membershipStartDate = Date.now();
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 12); // Annual
        user.membershipExpiry = expiry;

        await user.save();

        res.json({
            success: true,
            message: 'Upgraded to Premium Membership successfully',
            membershipTier: user.membershipTier,
            membershipExpiry: user.membershipExpiry
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, phone, addresses } = req.body;

        user.name = name ?? user.name;
        user.phone = phone ?? user.phone;
        if (addresses) user.addresses = addresses;

        // Handle avatar upload
        if (req.file) {
            if (user.avatar?.public_id) {
                await deleteFromCloudinary(user.avatar.public_id);
            }
            const result = await uploadToCloudinary(req.file.buffer, 'elegance/avatars');
            user.avatar = { public_id: result.public_id, url: result.secure_url };
        }

        const updated = await user.save();

        res.json({
            success: true,
            user: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                phone: updated.phone,
                avatar: updated.avatar,
                addresses: updated.addresses,
                membershipTier: updated.membershipTier,
                rewardPoints: updated.rewardPoints,
            },
            token: generateToken(updated._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Forgot Password - generate link and console log it
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Security: don't reveal if email exists, return success to prevent user enumeration
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link was sent.'
            });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and set it in DB
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

        await user.save({ validateBeforeSave: false });

        // Build the reset URL
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

        console.log(`\n======================================================`);
        console.log(`✉️  [SECURITY EMAIL SIMULATOR]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Elegance Password Reset Request`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log(`======================================================\n`);

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link was sent.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash the incoming token to match what's stored
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete Account (Self Deactivation)
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if there are active, processing, or shipped orders
        const pendingOrders = await Order.findOne({
            user: user._id,
            orderStatus: { $in: ['Received', 'Processing', 'Shipped', 'Design Review', 'Cutting', 'Tailoring', 'Quality Check', 'Ready'] }
        });

        if (pendingOrders) {
            return res.status(400).json({
                success: false,
                message: 'Your account cannot be deactivated while you have orders currently in progress. Please wait until they are completed or contact support.'
            });
        }

        // Soft deactivation to preserve audit log consistency
        user.isActive = false;
        user.deactivatedAt = Date.now();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Your account has been successfully deactivated according to privacy policies. If you did this by mistake, contact support to restore it.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update Communication Preferences
// @route   PUT /api/auth/communication-preferences
// @access  Private
const updateCommunicationPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { email, sms, whatsapp } = req.body;
        user.communicationPreferences = { email, sms, whatsapp };
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Communication preferences updated successfully.',
            communicationPreferences: user.communicationPreferences
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.role) query.role = req.query.role;
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({ success: true, users, page, pages: Math.ceil(total / limit), total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/auth/users/:id/toggle-active
// @access  Admin
const toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        // Log admin suspension action
        const actionStr = user.isActive ? 'Customer Account Restored' : 'Customer Account Suspended';
        await logActivity(req, actionStr, 'User', user._id, `Customer ${user.name} (${user.email}) active status toggled to ${user.isActive}.`);

        res.json({ success: true, isActive: user.isActive });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    upgradeMembership,
    changePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,
    updateCommunicationPreferences,
    getAllUsers,
    toggleUserActive,
};
