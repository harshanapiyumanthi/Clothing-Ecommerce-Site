const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ['Free', 'Premium', 'VIP'] },
    price: { type: Number, required: true, default: 0 },
    durationMonths: { type: Number, required: true, default: 12 },
    badgeColor: { type: String, default: '#000000' },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports = MembershipPlan;
