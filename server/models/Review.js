const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, default: '' },
        comment: { type: String, required: true },
        images: [{ public_id: String, url: String }],
        isVerifiedPurchase: { type: Boolean, default: false },
        helpfulVotes: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index — one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
