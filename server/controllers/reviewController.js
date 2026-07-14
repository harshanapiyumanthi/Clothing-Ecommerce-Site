const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// ─── Helper: recalculate product rating ───────────────────────────────────────
const recalculateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].numReviews,
        });
    } else {
        await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        highest: { rating: -1 },
        lowest: { rating: 1 },
        helpful: { helpfulVotes: -1 },
    };
    const sort = sortOptions[req.query.sort] || { createdAt: -1 };

    const query = { product: req.params.productId, isApproved: true };
    if (req.query.rating) query.rating = Number(req.query.rating);

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    // Rating distribution
    const distribution = await Review.aggregate([
        { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
    ]);

    res.json({
        success: true,
        reviews,
        page,
        pages: Math.ceil(total / limit),
        total,
        distribution,
    });
});

// @desc    Create a review for a product
// @route   POST /api/reviews/product/:productId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user._id,
    });

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this product');
    }

    // Check if verified purchase
    const hasPurchased = await Order.findOne({
        user: req.user._id,
        'orderItems.product': productId,
        orderStatus: 'Delivered',
    });

    // Upload review images if provided
    let images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/reviews');
            images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const review = await Review.create({
        product: productId,
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        title: title || '',
        comment,
        images,
        isVerifiedPurchase: !!hasPurchased,
    });

    await recalculateProductRating(product._id);

    res.status(201).json({ success: true, review });
});

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }

    const { rating, title, comment } = req.body;
    review.rating = rating ?? review.rating;
    review.title = title ?? review.title;
    review.comment = comment ?? review.comment;

    const updated = await review.save();
    await recalculateProductRating(review.product);

    res.json({ success: true, review: updated });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (own) / Admin
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    // Delete review images from Cloudinary
    for (const img of review.images) {
        await deleteFromCloudinary(img.public_id);
    }

    await review.deleteOne();
    await recalculateProductRating(review.product);

    res.json({ success: true, message: 'Review deleted' });
});

// @desc    Vote a review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { $inc: { helpfulVotes: 1 } },
        { new: true }
    );
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    res.json({ success: true, helpfulVotes: review.helpfulVotes });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Admin
const getAllReviews = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.approved !== undefined) query.isApproved = req.query.approved === 'true';

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({ success: true, reviews, page, pages: Math.ceil(total / limit), total });
});

// @desc    Toggle review approval (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Admin
const toggleApproval = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    review.isApproved = !review.isApproved;
    await review.save();
    await recalculateProductRating(review.product);
    res.json({ success: true, isApproved: review.isApproved });
});

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getAllReviews,
    toggleApproval,
};
