const mongoose = require('mongoose');

const savedDesignSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customizations: [
        {
            optionType: { type: String, required: true },
            optionValue: { type: String, required: true },
            optionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomizationOption' }
        }
    ],
    totalPrice: { type: Number, required: true },
    productionTime: { type: Number, required: true }, // in days
    previewImage: { type: String }, // Snapshot or reference
}, { timestamps: true });

const SavedDesign = mongoose.model('SavedDesign', savedDesignSchema);
module.exports = SavedDesign;
