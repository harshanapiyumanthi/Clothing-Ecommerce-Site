const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    fabric: { type: String },
    size: { type: String },
    color: { type: String },
    budget: { type: Number },
    referenceImages: [{ public_id: String, url: String }],
    status: { type: String, enum: ['Received', 'Design Review', 'Cutting', 'Tailoring', 'Quality Check', 'Ready', 'Delivered', 'Pending', 'Rejected'], default: 'Received' },
    adminNote: { type: String },
    quotedPrice: { type: Number },
    estimatedDelivery: { type: Date },
}, { timestamps: true });

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
module.exports = CustomOrder;
