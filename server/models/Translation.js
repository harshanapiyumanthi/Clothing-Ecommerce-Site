const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    values: {
        en: { type: String, required: true },
        si: { type: String, default: '' }, // Sinhala
        ta: { type: String, default: '' }  // Tamil
    },
    category: { type: String, default: 'General' } // e.g. "Navbar", "Checkout", "Buttons"
}, { timestamps: true });

const Translation = mongoose.model('Translation', translationSchema);
module.exports = Translation;
