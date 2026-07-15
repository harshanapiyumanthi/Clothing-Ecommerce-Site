const asyncHandler = require('express-async-handler');
const Color = require('../models/Color');

// @desc   Get all colors
// @route  GET /api/colors
// @access Public
const getColors = asyncHandler(async (req, res) => {
    const onlyActive = req.query.active === 'true';
    const filter = onlyActive ? { isActive: true } : {};
    const colors = await Color.find(filter).sort({ name: 1 });
    res.json({ success: true, colors });
});

// @desc   Create a color
// @route  POST /api/colors
// @access Private/Admin
const createColor = asyncHandler(async (req, res) => {
    const { name, hexCode } = req.body;
    if (!name || !hexCode) { res.status(400); throw new Error('Name and hex code required'); }
    const exists = await Color.findOne({ hexCode });
    if (exists) { res.status(400); throw new Error('Color with this hex already exists'); }
    const color = await Color.create({ name, hexCode });
    res.status(201).json({ success: true, color });
});

// @desc   Update a color
// @route  PUT /api/colors/:id
// @access Private/Admin
const updateColor = asyncHandler(async (req, res) => {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!color) { res.status(404); throw new Error('Color not found'); }
    res.json({ success: true, color });
});

// @desc   Delete a color
// @route  DELETE /api/colors/:id
// @access Private/Admin
const deleteColor = asyncHandler(async (req, res) => {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) { res.status(404); throw new Error('Color not found'); }
    res.json({ success: true, message: 'Color deleted' });
});

module.exports = { getColors, createColor, updateColor, deleteColor };
