const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    qty: { type: Number, required: true, default: 1 },
    isCustom: { type: Boolean, default: false },
    customization: { type: mongoose.Schema.Types.Mixed },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true, default: 'Sri Lanka' },
        phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, enum: ['Stripe', 'COD'] },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    trackingNumber: { type: String, default: '' },
    couponCode: { type: String },
    discount: { type: Number, default: 0 },
}, { timestamps: true });

// Add indexes for optimizing order queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1, isDelivered: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
