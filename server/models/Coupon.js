const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], default: 'percentage' },
    couponType: { type: String, enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    memberOnly: { type: Boolean, default: false },
    membershipRequired: { type: String, enum: ['All', 'Free', 'Premium', 'VIP'], default: 'All' },
    requiredPoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
