const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');
const logActivity = require('../utils/activityLogger');

// @desc    Get all products (with pagination, search, filter, sort)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const result = await productService.queryProducts(req.query);
    res.json({
        success: true,
        products: result.products,
        page: result.page,
        pages: result.pages,
        total: result.total
    });
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
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
    const product = await productService.createProduct(req.body, req.files, req.user);
    
    await logActivity(req, 'Product Created', 'Product', product._id, `Created product "${product.name}" with price $${product.price}`);

    res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { product, oldPrice } = await productService.updateProduct(req.params.id, req.body, req.files);

    const priceChanged = req.body.price !== undefined && Number(req.body.price) !== oldPrice;

    if (priceChanged) {
        await logActivity(req, 'Price Changed', 'Product', product._id, `Price of "${product.name}" changed from $${oldPrice} to $${product.price}`);
    } else {
        await logActivity(req, 'Product Updated', 'Product', product._id, `Updated details of "${product.name}"`);
    }

    res.json({ success: true, product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const productName = await productService.deleteProduct(req.params.id);

    await logActivity(req, 'Product Deleted', 'Product', req.params.id, `Deleted product "${productName}"`);

    res.json({ success: true, message: 'Product deleted' });
});

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    await productService.createProductReview(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    createProductReview 
};
