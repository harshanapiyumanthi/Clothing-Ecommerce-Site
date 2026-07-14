const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).populate('parent', 'name slug');
    res.json({ success: true, categories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) { res.status(404); throw new Error('Category not found'); }
    res.json({ success: true, category });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, description, parent } = req.body;
    let image = {};

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, 'elegance/categories');
        image = { public_id: result.public_id, url: result.secure_url };
    }

    const category = await Category.create({ name, slug, description, parent: parent || null, image });
    res.status(201).json({ success: true, category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) { res.status(404); throw new Error('Category not found'); }

    const { name, slug, description, parent, isActive } = req.body;
    category.name = name ?? category.name;
    category.slug = slug ?? category.slug;
    category.description = description ?? category.description;
    category.parent = parent ?? category.parent;
    category.isActive = isActive ?? category.isActive;

    if (req.file) {
        if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
        const result = await uploadToCloudinary(req.file.buffer, 'elegance/categories');
        category.image = { public_id: result.public_id, url: result.secure_url };
    }

    const updated = await category.save();
    res.json({ success: true, category: updated });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) { res.status(404); throw new Error('Category not found'); }
    if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
