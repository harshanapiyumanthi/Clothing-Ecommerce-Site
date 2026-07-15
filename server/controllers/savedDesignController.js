const SavedDesign = require('../models/SavedDesign');
const Product = require('../models/Product');

// @desc    Save a new customized design
// @route   POST /api/saved-designs
// @access  Private (Premium Only)
const saveDesign = async (req, res) => {
    try {
        if (req.user.membershipTier !== 'Premium') {
            return res.status(403).json({ success: false, message: 'Only Premium members can save custom designs.' });
        }

        const { productId, customizations, totalPrice, productionTime, previewImage } = req.body;
        
        const product = await Product.findById(productId);
        if (!product || !product.isPersonalizable) {
            return res.status(400).json({ success: false, message: 'Product is not personalizable.' });
        }

        const newDesign = await SavedDesign.create({
            user: req.user._id,
            product: productId,
            customizations,
            totalPrice,
            productionTime,
            previewImage
        });

        res.status(201).json({ success: true, savedDesign: newDesign });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get user's saved designs
// @route   GET /api/saved-designs
// @access  Private (Premium Only)
const getMySavedDesigns = async (req, res) => {
    try {
        if (req.user.membershipTier !== 'Premium') {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const designs = await SavedDesign.find({ user: req.user._id })
            .populate('product', 'name images category price')
            .populate('customizations.optionRef', 'type value image additionalPrice');
            
        res.json({ success: true, designs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { saveDesign, getMySavedDesigns };
