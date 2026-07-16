const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventType: {
        type: String,
        required: true,
        enum: [
            'product_view',
            'wishlist_add',
            'wishlist_remove',
            'cart_add',
            'cart_remove',
            'checkout_start',
            'checkout_success',
            'checkout_failure',
            'payment_failed',
            'banner_click',
            'recommendation_click',
            'search_query',
            'search_no_results',
            'customizer_open'
        ]
    },
    metadata: {
        productId: { type: String },
        productName: { type: String },
        categoryName: { type: String },
        color: { type: String },
        size: { type: String },
        fabric: { type: String },
        bannerId: { type: String },
        searchQuery: { type: String },
        paymentMethod: { type: String },
        failureReason: { type: String },
        couponCode: { type: String },
        amount: { type: Number },
        durationMs: { type: Number }
    },
    ip: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ 'metadata.productId': 1 });
analyticsEventSchema.index({ user: 1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
module.exports = AnalyticsEvent;
