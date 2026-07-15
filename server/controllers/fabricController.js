const asyncHandler = require('express-async-handler');
const Fabric = require('../models/Fabric');

// @desc   Get all fabrics
// @route  GET /api/fabrics
// @access Public
const getFabrics = asyncHandler(async (req, res) => {
    const onlyActive = req.query.active === 'true';
    const filter = onlyActive ? { isActive: true } : {};
    const fabrics = await Fabric.find(filter).sort({ name: 1 });
    res.json({ success: true, fabrics });
});

// @desc   Create a fabric
// @route  POST /api/fabrics
// @access Private/Admin
const createFabric = asyncHandler(async (req, res) => {
    const { name, description, surcharge } = req.body;
    if (!name) { res.status(400); throw new Error('Fabric name required'); }
    const fabric = await Fabric.create({ name, description, surcharge: surcharge || 0 });
    res.status(201).json({ success: true, fabric });
});

// @desc   Update a fabric
// @route  PUT /api/fabrics/:id
// @access Private/Admin
const updateFabric = asyncHandler(async (req, res) => {
    const fabric = await Fabric.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fabric) { res.status(404); throw new Error('Fabric not found'); }
    res.json({ success: true, fabric });
});

// @desc   Delete a fabric
// @route  DELETE /api/fabrics/:id
// @access Private/Admin
const deleteFabric = asyncHandler(async (req, res) => {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!fabric) { res.status(404); throw new Error('Fabric not found'); }
    res.json({ success: true, message: 'Fabric deleted' });
});

module.exports = { getFabrics, createFabric, updateFabric, deleteFabric };
