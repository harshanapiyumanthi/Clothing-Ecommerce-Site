const PaymentProvider = require('./PaymentProvider');
const Payment = require('../../models/Payment');

class CodProvider extends PaymentProvider {
    async createTransaction(user, amount, orderId) {
        const mockTransactionId = `cod_tx_${Math.random().toString(36).substring(2, 12)}`;

        const payment = await Payment.create({
            user: user._id,
            order: orderId || undefined,
            stripePaymentIntentId: mockTransactionId,
            amount,
            currency: 'usd',
            status: 'succeeded', // COD creates direct succeeded transaction placeholder because payment occurs on delivery
            paymentMethod: 'COD',
        });

        return {
            success: true,
            transactionId: mockTransactionId,
            paymentId: payment._id,
            status: 'succeeded'
        };
    }

    async verifyTransaction(transactionId) {
        return {
            status: 'succeeded',
            paymentMethod: 'COD',
        };
    }

    async refundTransaction(transactionId, amount) {
        return {
            success: true,
            refundId: `cod_ref_${Math.random().toString(36).substring(2, 12)}`,
            message: 'Simulated COD return credit processed successfully.'
        };
    }
}

module.exports = CodProvider;
