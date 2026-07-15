const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'redeemed'], required: true },
    reason: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }
}, { timestamps: true });

const RewardHistory = mongoose.model('RewardHistory', rewardHistorySchema);
module.exports = RewardHistory;
