const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    countries: [{ type: String, required: true }],
    baseCost: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, default: 0 }, // as percentage
    dutyRate: { type: Number, default: 0 }, // customs duties percentage
    deliveryEstimate: { type: String, required: true }, // e.g. "3-5 Business Days"
    courierPartner: { type: String, default: 'DHL Express' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ShippingZone = mongoose.model('ShippingZone', shippingZoneSchema);
module.exports = ShippingZone;
