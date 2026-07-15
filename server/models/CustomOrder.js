const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    customizations: [
        {
            optionType: { type: String, required: true },
            optionValue: { type: String, required: true },
            optionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomizationOption' }
        }
    ],
    budget: { type: Number },
    referenceImages: [{ public_id: String, url: String }],
    status: { type: String, enum: ['Received', 'Design Review', 'Cutting', 'Tailoring', 'Quality Check', 'Ready', 'Delivered', 'Pending', 'Rejected'], default: 'Received' },
    adminNote: { type: String },
    quotedPrice: { type: Number },
    estimatedDelivery: { type: Date },
}, { timestamps: true });

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
module.exports = CustomOrder;
