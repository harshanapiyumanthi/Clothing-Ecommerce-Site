const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock');
    res.json({ success: true, cart: cart || { items: [] } });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) { res.status(404); throw new Error('Product not found'); }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size && i.color === color
    );

    if (existingItem) {
        existingItem.qty = qty;
    } else {
        cart.items.push({
            product: productId,
            name: product.name,
            image: product.images[0]?.url || '',
            price: product.price,
            size,
            color,
            qty,
        });
    }

    await cart.save();
    res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) { res.status(404); throw new Error('Cart not found'); }

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    res.json({ success: true, cart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };
