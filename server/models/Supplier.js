const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    suppliedCategories: [{ type: String, enum: ['Fabric', 'Accessories', 'Packaging', 'Finished Goods'] }],
    suppliedMaterials: [{ type: String }], // e.g. ["Georgette Silk", "Merino Wool"]
    address: { type: String },
    contractStatus: { type: String, enum: ['Active', 'Negotiating', 'Terminated'], default: 'Active' }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
