const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: [
            'PaymentSuccess',
            'PaymentFailed',
            'OrderConfirmed',
            'OrderProcessing',
            'OrderShipping',
            'OrderDelivered',
            'MembershipRenewal',
            'CustomizationProgress',
            'System'
        ],
        default: 'System'
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
