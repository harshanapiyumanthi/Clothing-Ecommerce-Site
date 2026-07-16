const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 10000 },
    stockMap: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 0 }
        }
    ],
    status: { type: String, enum: ['Active', 'Full', 'Maintenance'], default: 'Active' }
}, { timestamps: true });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
module.exports = Warehouse;
