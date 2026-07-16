const Product = require('../models/Product');
const CustomizationOption = require('../models/CustomizationOption');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const logActivity = require('../utils/activityLogger');

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

const queryProducts = async (queryParams) => {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 12;
    const skip = (page - 1) * limit;

    const sortOptions = {
        latest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        rating: { rating: -1 },
        popular: { sold: -1 },
    };
    const sort = sortOptions[queryParams.sort] || { createdAt: -1 };
    const query = buildProductQuery(queryParams);

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        products,
        page,
        pages: Math.ceil(total / limit),
        total
    };
};

const getProductById = async (id) => {
    return await Product.findById(id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'name')
        .populate('recommendations', 'name price discountPrice images category brand rating sizes colors stock isFeatured isBestSeller');
};

const createProduct = async (productData, files, user) => {
    const { name, description, price, discountPrice, category, brand, sizes, colors, stock, isFeatured, isBestSeller, tags, recommendations } = productData;

    let images = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/products');
            images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const product = await Product.create({
        name, description, price, discountPrice, category, brand,
        sizes: sizes ? JSON.parse(sizes) : [],
        colors: colors ? JSON.parse(colors) : [],
        stock: Number(stock || 0), 
        isFeatured: isFeatured === 'true' || isFeatured === true, 
        isBestSeller: isBestSeller === 'true' || isBestSeller === true,
        tags: tags ? JSON.parse(tags) : [],
        recommendations: recommendations ? JSON.parse(recommendations) : [],
        images,
        createdBy: user._id,
    });

    return product;
};

const updateProduct = async (id, productData, files) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    const { name, description, price, discountPrice, category, brand, sizes, colors, stock, isFeatured, isBestSeller, tags, recommendations } = productData;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discountPrice = discountPrice !== undefined ? Number(discountPrice) : product.discountPrice;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : product.isFeatured;
    product.isBestSeller = isBestSeller !== undefined ? (isBestSeller === 'true' || isBestSeller === true) : product.isBestSeller;
    
    if (sizes) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    if (colors) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    if (tags) product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (recommendations) product.recommendations = typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations;

    if (files && files.length > 0) {
        for (const img of product.images) {
            await deleteFromCloudinary(img.public_id);
        }
        product.images = [];
        for (const file of files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/products');
            product.images.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const updated = await product.save();
    
    // Inventory trigger checking
    await handleStockLevelChange(updated);

    return { product: updated, oldPrice: product.price };
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    for (const img of product.images) {
        await deleteFromCloudinary(img.public_id);
    }
    const name = product.name;
    await product.deleteOne();
    return name;
};

const createProductReview = async (id, reviewData, user) => {
    const { rating, comment } = reviewData;
    const product = await Product.findById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === user._id.toString()
    );

    if (alreadyReviewed) {
        throw new Error('You have already reviewed this product');
    }

    const review = {
        user: user._id,
        name: user.name,
        rating: Number(rating),
        comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;

    await product.save();
    return product;
};

// Internal method to handle stock drop/trigger events
const handleStockLevelChange = async (product) => {
    if (product.stock <= 0) {
        // Hides customization options that use this fabric or material name
        await CustomizationOption.updateMany(
            { value: { $regex: new RegExp(`^${product.name}$`, 'i') } },
            { isActive: false }
        );
        // Also if we have fabric options linked by fabric name
        if (product.tags && product.tags.length > 0) {
            await CustomizationOption.updateMany(
                { type: 'Fabric', value: { $in: product.tags } },
                { isActive: false }
            );
        }
    }
};

module.exports = {
    queryProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    handleStockLevelChange
};
