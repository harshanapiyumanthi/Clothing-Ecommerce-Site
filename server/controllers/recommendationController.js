const asyncHandler = require('express-async-handler');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Interaction weight scores
const WEIGHTS = { view: 1, wishlist: 2, cart: 3, purchase: 5 };

// @desc    Track user interaction with a product
// @route   POST /api/recommendations/track
// @access  Private
const trackInteraction = asyncHandler(async (req, res) => {
    const { productId, type } = req.body;

    if (!['view', 'cart', 'purchase', 'wishlist'].includes(type)) {
        res.status(400);
        throw new Error('Invalid interaction type');
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let rec = await Recommendation.findOne({ user: req.user._id });

    if (!rec) {
        rec = await Recommendation.create({
            user: req.user._id,
            interactions: [],
            recommendedProducts: [],
        });
    }

    // Add interaction
    rec.interactions.push({
        product: productId,
        type,
        score: WEIGHTS[type],
        timestamp: new Date(),
    });

    // Keep only last 200 interactions
    if (rec.interactions.length > 200) {
        rec.interactions = rec.interactions.slice(-200);
    }

    // Recalculate scores for recommendations
    const scoreMap = {};
    for (const interaction of rec.interactions) {
        const pid = interaction.product.toString();
        scoreMap[pid] = (scoreMap[pid] || 0) + interaction.score;
    }

    // Fetch top-scored product categories for collaborative filtering
    const topProductIds = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

    const topProducts = await Product.find({ _id: { $in: topProductIds } }).select('category tags');
    const relatedCategories = [...new Set(topProducts.map((p) => p.category?.toString()))].filter(Boolean);
    const relatedTags = [...new Set(topProducts.flatMap((p) => p.tags || []))];

    // Find similar products the user hasn't interacted with
    const interactedIds = Object.keys(scoreMap);
    const similar = await Product.find({
        _id: { $nin: interactedIds },
        $or: [
            { category: { $in: relatedCategories } },
            { tags: { $in: relatedTags } },
        ],
        stock: { $gt: 0 },
    })
        .sort({ sold: -1, rating: -1 })
        .limit(20)
        .select('_id');

    rec.recommendedProducts = similar.map((p) => ({
        product: p._id,
        score: scoreMap[p._id.toString()] || 0,
    }));

    rec.lastUpdated = new Date();
    await rec.save();

    res.json({ success: true, message: 'Interaction tracked' });
});

// @desc    Get personalized recommendations for logged-in user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 12;

    const rec = await Recommendation.findOne({ user: req.user._id });

    if (!rec || rec.recommendedProducts.length === 0) {
        // Fallback: return best sellers
        const products = await Product.find({ stock: { $gt: 0 } })
            .populate('category', 'name slug')
            .sort({ sold: -1, rating: -1 })
            .limit(limit)
            .lean();
        return res.json({ success: true, products, personalized: false });
    }

    const topIds = rec.recommendedProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => r.product);

    const products = await Product.find({ _id: { $in: topIds } })
        .populate('category', 'name slug')
        .lean();

    res.json({ success: true, products, personalized: true });
});

// @desc    Get similar products (content-based)
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 8;
    const product = await Product.findById(req.params.productId).lean();

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const similar = await Product.find({
        _id: { $ne: product._id },
        $or: [
            { category: product.category },
            { tags: { $in: product.tags || [] } },
            { brand: product.brand },
        ],
        stock: { $gt: 0 },
    })
        .populate('category', 'name slug')
        .sort({ rating: -1, sold: -1 })
        .limit(limit)
        .lean();

    res.json({ success: true, products: similar });
});

// @desc    Get frequently bought together (based on order history)
// @route   GET /api/recommendations/bought-together/:productId
// @access  Public
const getBoughtTogether = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 4;
    const productId = req.params.productId;

    // Find orders containing this product
    const orders = await Order.find({
        'orderItems.product': productId,
    }).select('orderItems.product');

    // Collect co-occurring products
    const coOccurrence = {};
    for (const order of orders) {
        for (const item of order.orderItems) {
            const pid = item.product.toString();
            if (pid !== productId) {
                coOccurrence[pid] = (coOccurrence[pid] || 0) + 1;
            }
        }
    }

    const topIds = Object.entries(coOccurrence)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

    if (topIds.length === 0) {
        return res.json({ success: true, products: [] });
    }

    const products = await Product.find({ _id: { $in: topIds } })
        .populate('category', 'name slug')
        .lean();

    res.json({ success: true, products });
});

module.exports = {
    trackInteraction,
    getRecommendations,
    getSimilarProducts,
    getBoughtTogether,
};
