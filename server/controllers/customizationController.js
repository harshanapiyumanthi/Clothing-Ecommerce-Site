const CustomizationOption = require('../models/CustomizationOption');

// @desc    Get all customization options
// @route   GET /api/customizations
// @access  Public
const getOptions = async (req, res) => {
    try {
        const options = await CustomizationOption.find({ isActive: true });
        res.json({ success: true, options });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a customization option
// @route   POST /api/customizations
// @access  Admin
const createOption = async (req, res) => {
    try {
        const { type, value, additionalPrice } = req.body;
        const option = await CustomizationOption.create({ type, value, additionalPrice });
        res.status(201).json({ success: true, option });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update a customization option
// @route   PUT /api/customizations/:id
// @access  Admin
const updateOption = async (req, res) => {
    try {
        const option = await CustomizationOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!option) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        res.json({ success: true, option });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a customization option
// @route   DELETE /api/customizations/:id
// @access  Admin
const deleteOption = async (req, res) => {
    try {
        const option = await CustomizationOption.findByIdAndDelete(req.params.id);
        if (!option) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        res.json({ success: true, message: 'Option deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getOptions,
    createOption,
    updateOption,
    deleteOption
};
