const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price images rating');
    res.json({ success: true, wishlist: wishlist || { products: [] } });
});

// @desc    Toggle product in wishlist (add/remove)
// @route   POST /api/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        return res.json({ success: true, message: 'Added to wishlist', wishlist });
    }

    const isInWishlist = wishlist.products.some((p) => p.toString() === productId);

    if (isInWishlist) {
        wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
        await wishlist.save();
        return res.json({ success: true, message: 'Removed from wishlist', wishlist });
    } else {
        wishlist.products.push(productId);
        await wishlist.save();
        return res.json({ success: true, message: 'Added to wishlist', wishlist });
    }
});

module.exports = { getWishlist, toggleWishlist };
