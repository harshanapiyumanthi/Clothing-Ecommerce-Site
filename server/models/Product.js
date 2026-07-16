const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: '' },
    images: [{ public_id: String, url: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    visibility: { type: String, enum: ['public', 'private', 'members-only'], default: 'public' },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isPersonalizable: { type: Boolean, default: false },
    baseProductionTime: { type: Number, default: 2 },
    allowedCustomizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CustomizationOption' }],
    // Future Try-On & 3D Asset Support
    threeDModelUrl: { type: String, default: '' },
    arTextureUrl: { type: String, default: '' },
    bodyMeasurementMapping: {
        targetHeightMin: { type: Number },
        targetHeightMax: { type: Number },
        targetChestMin: { type: Number },
        targetChestMax: { type: Number },
        targetWaistMin: { type: Number },
        targetWaistMax: { type: Number }
    },
    // Multi-Language Support
    translations: {
        name: {
            en: { type: String, default: '' },
            si: { type: String, default: '' },
            ta: { type: String, default: '' }
        },
        description: {
            en: { type: String, default: '' },
            si: { type: String, default: '' },
            ta: { type: String, default: '' }
        }
    }
}, { timestamps: true });

// Full-text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Additional indexes for performance optimization
productSchema.index({ category: 1, rating: -1 });
productSchema.index({ stock: 1, sold: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
