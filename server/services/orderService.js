const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const CustomizationOption = require('../models/CustomizationOption');
const settingService = require('./settingService');
const productService = require('./productService');

// Transaction helper supporting fallback for standalone MongoDB
const runInTransaction = async (workFn) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
    } catch (txError) {
        session.endSession();
        return await workFn(null);
    }

    try {
        const result = await workFn(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        session.endSession();
    }
};

const createOrder = async (orderData, user) => {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = orderData;
    
    if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items');
    }

    return await runInTransaction(async (session) => {
        // 1. Verify stock availability inside transaction
        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.qty) {
                throw new Error(`Insufficient stock for: ${product.name}`);
            }
        }

        // 2. Coupon Discount Calculation
        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }).session(session);
            if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.maxUsage) {
                discount = coupon.couponType === 'percentage' || coupon.discountType === 'percentage'
                    ? (orderItems.reduce((a, i) => a + i.price * i.qty, 0) * coupon.discountValue) / 100
                    : coupon.discountValue;
                coupon.usedCount += 1;
                await coupon.save({ session });
            }
        }

        // 3. Dynamic settings from DB instead of hardcoded
        const shippingCharge = await settingService.getSetting('shippingCharge');
        const freeShippingThreshold = await settingService.getSetting('freeShippingThreshold');
        const rewardPointsPerDollar = await settingService.getSetting('rewardPointsPerDollar');

        const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
        const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : shippingCharge;
        const totalPrice = itemsPrice + shippingPrice - discount;

        // 4. Create Order
        const order = new Order({
            user: user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            couponCode,
            discount,
        });
        await order.save({ session });

        // 5. Reduce stock and sold counts
        for (const item of orderItems) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product, 
                { $inc: { stock: -item.qty, sold: item.qty } }, 
                { new: true, session }
            );
            // Stock trigger
            await productService.handleStockLevelChange(updatedProduct);
        }

        // 6. Clear customer cart
        await Cart.findOneAndDelete({ user: user._id }).session(session);

        // 7. Add reward points to User
        const rewardPointsEarned = Math.floor(totalPrice * rewardPointsPerDollar);
        if (rewardPointsEarned > 0) {
            user.rewardPoints += rewardPointsEarned;
            await user.save({ session });
        }

        // 8. Create Payment record for Cash on Delivery (COD)
        if (paymentMethod === 'COD') {
            await Payment.create([{
                user: user._id,
                order: order._id,
                amount: totalPrice,
                currency: 'usd',
                status: 'pending',
                paymentMethod: 'COD',
            }], { session });
        }

        return order;
    });
};

const updateOrderStatus = async (orderId, newStatus, trackingNumber) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    if (newStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
        // Restore stock
        for (const item of order.orderItems) {
            const product = await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.qty, sold: -item.qty },
            }, { new: true });
            
            // Re-check option visibility since stock increased
            if (product.stock > 0) {
                await CustomizationOption.updateMany(
                    { value: { $regex: new RegExp(`^${product.name}$`, 'i') } },
                    { isActive: true }
                );
            }
        }
    }

    const updated = await order.save();
    return { order: updated, oldStatus };
};

const markOrderAsPaid = async (orderId, paymentDetails, user, isAdmin) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (order.user.toString() !== user._id.toString() && !isAdmin) {
        throw new Error('Not authorized');
    }

    const { id, status, update_time, email_address } = paymentDetails;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id, status, update_time, email_address };
    order.orderStatus = 'Confirmed';

    const updated = await order.save();

    if (id) {
        await Payment.findOneAndUpdate(
            { stripePaymentIntentId: id },
            { status: 'succeeded' }
        );
    }

    return updated;
};

module.exports = {
    createOrder,
    updateOrderStatus,
    markOrderAsPaid,
    runInTransaction
};
