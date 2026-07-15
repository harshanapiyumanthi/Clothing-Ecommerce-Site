const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        stripePaymentIntentId: { type: String },
        stripeChargeId: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'usd' },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'refunded', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['Stripe', 'Mintpay', 'FLEX', 'COD'],
            required: true,
        },
        paymentMethodDetails: {
            brand: String,
            last4: String,
            expMonth: Number,
            expYear: Number,
        },
        receiptUrl: { type: String },
        failureReason: { type: String },
        refundedAt: { type: Date },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
