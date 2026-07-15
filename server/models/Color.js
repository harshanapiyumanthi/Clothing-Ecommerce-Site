const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    hexCode: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Color = mongoose.model('Color', colorSchema);
module.exports = Color;
