const mongoose = require('mongoose');

const vendorStoreSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commissionRate: { type: Number, required: true, default: 10 }, // standard 10% commission
    rating: { type: Number, default: 0 },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Approved', 'Pending', 'Suspended'], default: 'Pending' }
}, { timestamps: true });

const VendorStore = mongoose.model('VendorStore', vendorStoreSchema);
module.exports = VendorStore;
