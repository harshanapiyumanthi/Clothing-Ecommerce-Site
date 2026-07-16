const PaymentProvider = require('./PaymentProvider');
const Payment = require('../../models/Payment');

class FlexProvider extends PaymentProvider {
    async createTransaction(user, amount, orderId) {
        const mockTransactionId = `flex_tx_${Math.random().toString(36).substring(2, 12)}`;
        const mockCheckoutUrl = `https://portal.flex.lk/checkout/${mockTransactionId}`;

        const payment = await Payment.create({
            user: user._id,
            order: orderId || undefined,
            stripePaymentIntentId: mockTransactionId,
            amount,
            currency: 'usd',
            status: 'pending',
            paymentMethod: 'FLEX',
        });

        return {
            success: true,
            transactionId: mockTransactionId,
            checkoutUrl: mockCheckoutUrl,
            paymentId: payment._id,
        };
    }

    async verifyTransaction(transactionId) {
        return {
            status: 'succeeded',
            paymentMethod: 'FLEX',
        };
    }

    async refundTransaction(transactionId, amount) {
        return {
            success: true,
            refundId: `flex_ref_${Math.random().toString(36).substring(2, 12)}`,
            message: 'Simulated FLEX refund processed successfully.'
        };
    }
}

module.exports = FlexProvider;
