const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['view', 'cart', 'purchase', 'wishlist'], required: true },
    score: { type: Number, default: 1 }, // view=1, cart=3, wishlist=2, purchase=5
    timestamp: { type: Date, default: Date.now },
});

const recommendationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        interactions: [interactionSchema],
        recommendedProducts: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                score: { type: Number, default: 0 },
            },
        ],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;
