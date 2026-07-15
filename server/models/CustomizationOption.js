const mongoose = require('mongoose');

const customizationOptionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['Neck Style', 'Sleeve Style', 'Shoulder Style', 'Fabric', 'Decoration', 'Waist Style', 'Length']
    },
    value: { type: String, required: true },
    image: { public_id: String, url: String },
    isActive: { type: Boolean, default: true },
    additionalPrice: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent duplicate combinations
customizationOptionSchema.index({ type: 1, value: 1 }, { unique: true });

const CustomizationOption = mongoose.model('CustomizationOption', customizationOptionSchema);
module.exports = CustomizationOption;
