const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// Helper to build query filters
const buildProductQuery = (queryParams) => {
    const { keyword, category, minPrice, maxPrice, color, size, isFeatured, isBestSeller } = queryParams;
    const query = {};

    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isBestSeller) query.isBestSeller = isBestSeller === 'true';
    if (color) query.colors = { $in: [color] };
    if (size) query.sizes = { $in: [size] };
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    return query;
};

// @desc    Get all products (with pagination, search, filter, sort)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const sortOptions = {
        latest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        rating: { rating: -1 },
        popular: { sold: -1 },
    };
    const sort = sortOptions[req.query.sort] || { createdAt: -1 };
    const query = buildProductQuery(req.query);

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(total / limit),
        total,
    });
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'name');

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json({ success: true, product });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, discountPrice, category, brand, sizes, colors, stock, isFeatured, isBestSeller, tags } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/products');
            images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const product = await Product.create({
        name, description, price, discountPrice, category, brand,
        sizes: sizes ? JSON.parse(sizes) : [],
        colors: colors ? JSON.parse(colors) : [],
        stock, isFeatured, isBestSeller,
        tags: tags ? JSON.parse(tags) : [],
        images,
        createdBy: req.user._id,
    });

    res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const { name, description, price, discountPrice, category, brand, sizes, colors, stock, isFeatured, isBestSeller, tags } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discountPrice = discountPrice ?? product.discountPrice;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.stock = stock ?? product.stock;
    product.isFeatured = isFeatured ?? product.isFeatured;
    product.isBestSeller = isBestSeller ?? product.isBestSeller;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (colors) product.colors = JSON.parse(colors);
    if (tags) product.tags = JSON.parse(tags);

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
        for (const img of product.images) {
            await deleteFromCloudinary(img.public_id);
        }
        product.images = [];
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/products');
            product.images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const updated = await product.save();
    res.json({ success: true, product: updated });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    for (const img of product.images) {
        await deleteFromCloudinary(img.public_id);
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
});

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this product');
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview };
