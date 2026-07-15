const mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    surcharge: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Fabric = mongoose.model('Fabric', fabricSchema);
module.exports = Fabric;
