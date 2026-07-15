const User = require('../models/User');
const generateToken = require('../utils/generateToken');
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

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account has been deactivated' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
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
        
        // Mock payment verification logic would go here
        user.membershipTier = 'Premium';
        await user.save();
        
        res.json({ success: true, message: 'Upgraded to Premium Membership successfully', membershipTier: user.membershipTier });
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
            },
            token: generateToken(updated._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
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

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Security: don't reveal if email exists
            return res.json({ success: true, message: 'If an account with that email exists, a password reset link was sent.' });
        }

        // NOTE: In production, generate a reset token, store it on the user, and send email via NodeMailer/SES
        console.log(`[INFO] Password reset requested for: ${email}`);

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link was sent.',
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
        await user.save();
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
    getAllUsers,
    toggleUserActive,
};
