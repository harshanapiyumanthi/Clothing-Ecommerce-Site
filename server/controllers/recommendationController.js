const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Interaction weight scores
const WEIGHTS = { view: 1, wishlist: 2, cart: 3, purchase: 5 };

// Helper to resolve product by MongoDB ID or Mock ID
const resolveProduct = async (productId) => {
    if (mongoose.Types.ObjectId.isValid(productId)) {
        return await Product.findById(productId);
    }
    // If it's a mock ID like "prod-1", resolve by name
    const mockMap = {
        'prod-1': 'Silk Evening Gown',
        'prod-2': 'Classic Office Blazer',
        'prod-3': 'Designer Leather Handbag',
        'prod-4': 'Casual Denim Overshirt',
        'prod-5': 'Velvet Stiletto Heels',
    };
    const name = mockMap[productId];
    if (name) {
        return await Product.findOne({ name: new RegExp(`^${name}$`, 'i') });
    }
    return null;
};

// Helper to map DB product name back to mock ID
const getMockIdForName = (name) => {
    const mockMap = {
        'silk evening gown': 'prod-1',
        'classic office blazer': 'prod-2',
        'designer leather handbag': 'prod-3',
        'casual denim overshirt': 'prod-4',
        'velvet stiletto heels': 'prod-5',
    };
    return mockMap[name.toLowerCase()];
};

// @desc    Track user interaction with a product
// @route   POST /api/recommendations/track
// @access  Private
const trackInteraction = asyncHandler(async (req, res) => {
    const { productId, type } = req.body;

    if (!['view', 'cart', 'purchase', 'wishlist'].includes(type)) {
        res.status(400);
        throw new Error('Invalid interaction type');
    }

    const product = await resolveProduct(productId);
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
        product: product._id,
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
    const resolved = await resolveProduct(req.params.productId);

    if (!resolved) {
        // Fallback: return general popular products
        const fallback = await Product.find({ stock: { $gt: 0 } })
            .populate('category', 'name slug')
            .limit(limit)
            .lean();
        return res.json({ success: true, products: fallback });
    }

    const similar = await Product.find({
        _id: { $ne: resolved._id },
        $or: [
            { category: resolved.category },
            { tags: { $in: resolved.tags || [] } },
            { brand: resolved.brand },
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
    const resolved = await resolveProduct(req.params.productId);

    if (!resolved) {
        return res.json({ success: true, products: [] });
    }

    const productId = resolved._id;

    // Find orders containing this product
    const orders = await Order.find({
        'orderItems.product': productId,
    }).select('orderItems.product');

    // Collect co-occurring products
    const coOccurrence = {};
    for (const order of orders) {
        for (const item of order.orderItems) {
            const pid = item.product.toString();
            if (pid !== productId.toString()) {
                coOccurrence[pid] = (coOccurrence[pid] || 0) + 1;
            }
        }
    }

    const topIds = Object.entries(coOccurrence)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

    if (topIds.length === 0) {
        // Fallback: load best sellers
        const fallbacks = await Product.find({ _id: { $ne: productId }, stock: { $gt: 0 } })
            .sort({ sold: -1 })
            .limit(limit)
            .populate('category', 'name slug')
            .lean();
        return res.json({ success: true, products: fallbacks });
    }

    const products = await Product.find({ _id: { $in: topIds } })
        .populate('category', 'name slug')
        .lean();

    res.json({ success: true, products });
});

// @desc    Get manually assigned recommended accessories for a product
// @route   GET /api/recommendations/assigned/:productId
// @access  Public
const getAssignedRecommendations = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const resolved = await resolveProduct(productId);

    if (!resolved) {
        // Fallback: return default accessories
        const accs = await Product.find({ category: await getAccessoriesCategoryId() })
            .limit(3)
            .lean();
        return res.json({ success: true, products: accs });
    }

    const populated = await Product.findById(resolved._id)
        .populate({
            path: 'recommendations',
            populate: { path: 'category', select: 'name slug' }
        });

    res.json({ success: true, products: populated.recommendations || [] });
});

// @desc    Save manual recommendation mappings for admin
// @route   PUT /api/recommendations/admin/:productId
// @access  Private/Admin
const saveAssignedRecommendations = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { assignedProducts } = req.body;

    const mainProduct = await resolveProduct(productId);
    if (!mainProduct) {
        res.status(404);
        throw new Error('Primary product not found');
    }

    const resolvedIds = [];
    if (assignedProducts && Array.isArray(assignedProducts)) {
        for (const id of assignedProducts) {
            const resolved = await resolveProduct(id);
            if (resolved) {
                resolvedIds.push(resolved._id);
            }
        }
    }

    mainProduct.recommendations = resolvedIds;
    await mainProduct.save();

    // Return the updated recommendation mappings for the admin panel
    const allProducts = await Product.find({ recommendations: { $exists: true, $not: { $size: 0 } } })
        .populate('recommendations');

    const formattedRecs = allProducts.map(p => {
        const mockPrimaryId = getMockIdForName(p.name) || p._id.toString();
        const mockAssigned = p.recommendations.map(r => getMockIdForName(r.name) || r._id.toString());
        return {
            productId: mockPrimaryId,
            accessoryCategory: 'Accessories',
            assignedProducts: mockAssigned
        };
    });

    res.json({ success: true, recommendations: formattedRecs });
});

// @desc    Get all manual recommendation mappings for admin
// @route   GET /api/recommendations/admin
// @access  Private/Admin
const getAllAdminRecommendations = asyncHandler(async (req, res) => {
    const products = await Product.find({ recommendations: { $exists: true, $not: { $size: 0 } } })
        .populate('recommendations');

    const formatted = products.map(p => {
        const mockPrimaryId = getMockIdForName(p.name) || p._id.toString();
        const mockAssigned = p.recommendations.map(r => getMockIdForName(r.name) || r._id.toString());
        return {
            productId: mockPrimaryId,
            accessoryCategory: 'Accessories',
            assignedProducts: mockAssigned
        };
    });

    res.json({ success: true, recommendations: formatted });
});

// Helper helper to get accessories category ID
const getAccessoriesCategoryId = async () => {
    const Category = require('../models/Category');
    const cat = await Category.findOne({ name: /accessories/i });
    return cat ? cat._id : null;
};

module.exports = {
    trackInteraction,
    getRecommendations,
    getSimilarProducts,
    getBoughtTogether,
    getAssignedRecommendations,
    saveAssignedRecommendations,
    getAllAdminRecommendations
};
