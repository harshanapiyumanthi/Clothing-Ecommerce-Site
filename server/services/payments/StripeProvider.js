const PaymentProvider = require('./PaymentProvider');
const stripe = require('../../config/stripe');
const Payment = require('../../models/Payment');

class StripeProvider extends PaymentProvider {
    async createTransaction(user, amount, orderId) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // in cents
            currency: 'usd',
            metadata: {
                userId: user._id.toString(),
                orderId: orderId || '',
            },
        });

        // Record pending payment in DB
        const payment = await Payment.create({
            user: user._id,
            order: orderId || undefined,
            stripePaymentIntentId: paymentIntent.id,
            amount,
            currency: 'usd',
            status: 'pending',
            paymentMethod: 'Stripe',
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id,
            paymentId: payment._id,
        };
    }

    async verifyTransaction(transactionId) {
        const intent = await stripe.paymentIntents.retrieve(transactionId);
        return {
            status: intent.status === 'succeeded' ? 'succeeded' : intent.status === 'requires_payment_method' ? 'failed' : 'pending',
            failureReason: intent.last_payment_error?.message || null,
            brand: intent.payment_method_details?.card?.brand,
            last4: intent.payment_method_details?.card?.last4,
            raw: intent
        };
    }

    async refundTransaction(transactionId, amount) {
        const refund = await stripe.refunds.create({
            payment_intent: transactionId,
            amount: amount ? Math.round(amount * 100) : undefined
        });
        return {
            success: refund.status === 'succeeded',
            refundId: refund.id,
            raw: refund
        };
    }
}

module.exports = StripeProvider;
