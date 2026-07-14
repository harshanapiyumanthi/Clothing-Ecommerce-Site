const asyncHandler = require('express-async-handler');
const CustomOrder = require('../models/CustomOrder');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

const createCustomOrder = asyncHandler(async (req, res) => {
    const { description, fabric, size, color, budget } = req.body;
    let referenceImages = [];

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, 'elegance/custom-orders');
            referenceImages.push({ public_id: result.public_id, url: result.secure_url });
        }
    }

    const customOrder = await CustomOrder.create({
        user: req.user._id, description, fabric, size, color, budget, referenceImages,
    });
    res.status(201).json({ success: true, customOrder });
});

const getMyCustomOrders = asyncHandler(async (req, res) => {
    const orders = await CustomOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
});

const getAllCustomOrders = asyncHandler(async (req, res) => {
    const orders = await CustomOrder.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
});

const updateCustomOrderStatus = asyncHandler(async (req, res) => {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Custom order not found'); }
    order.status = req.body.status ?? order.status;
    order.adminNote = req.body.adminNote ?? order.adminNote;
    order.quotedPrice = req.body.quotedPrice ?? order.quotedPrice;
    order.estimatedDelivery = req.body.estimatedDelivery ?? order.estimatedDelivery;
    await order.save();
    res.json({ success: true, order });
});

module.exports = { createCustomOrder, getMyCustomOrders, getAllCustomOrders, updateCustomOrderStatus };
