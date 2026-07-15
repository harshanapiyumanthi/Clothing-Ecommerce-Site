const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, minOrderAmount, maxUsage, expiresAt, isActive } = req.body;

    if (!code || !discountValue || !expiresAt) {
        res.status(400);
        throw new Error('Code, discountValue, and expiresAt are required');
    }

    const uppercaseCode = code.toUpperCase();
    const couponExists = await Coupon.findOne({ code: uppercaseCode });

    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
        code: uppercaseCode,
        discountType: discountType || 'percentage',
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxUsage: maxUsage || 100,
        expiresAt,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, coupon });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Coupon.countDocuments({});
    const coupons = await Coupon.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        coupons,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get coupon by ID (Admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    res.json({ success: true, coupon });
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    const { code, discountType, discountValue, minOrderAmount, maxUsage, expiresAt, isActive } = req.body;

    if (code) {
        const uppercaseCode = code.toUpperCase();
        const codeConflict = await Coupon.findOne({ code: uppercaseCode, _id: { $ne: coupon._id } });
        if (codeConflict) {
            res.status(400);
            throw new Error('Coupon code already exists');
        }
        coupon.code = uppercaseCode;
    }

    coupon.discountType = discountType !== undefined ? discountType : coupon.discountType;
    coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
    coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount;
    coupon.maxUsage = maxUsage !== undefined ? maxUsage : coupon.maxUsage;
    coupon.expiresAt = expiresAt !== undefined ? expiresAt : coupon.expiresAt;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();

    res.json({ success: true, coupon: updatedCoupon });
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted successfully' });
});

// @desc    Validate a coupon code (Public/Checkout)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Coupon code is required');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }

    if (!coupon.isActive) {
        res.status(400);
        throw new Error('This coupon is no longer active');
    }

    if (coupon.usedCount >= coupon.maxUsage) {
        res.status(400);
        throw new Error('This coupon usage limit has been reached');
    }

    if (new Date() > new Date(coupon.expiresAt)) {
        res.status(400);
        throw new Error('This coupon has expired');
    }

    if (cartTotal < coupon.minOrderAmount) {
        res.status(400);
        throw new Error(`Minimum purchase of $${coupon.minOrderAmount} required for this coupon`);
    }

    res.json({
        success: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
    });
});

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon
};
