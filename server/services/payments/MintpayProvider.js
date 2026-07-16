const PaymentProvider = require('./PaymentProvider');
const Payment = require('../../models/Payment');

class MintpayProvider extends PaymentProvider {
    async createTransaction(user, amount, orderId) {
        // Mintpay splits the transaction into 3 interest-free installments
        const installmentAmount = (amount / 3).toFixed(2);
        
        // Mock a transaction ID and a simulated portal checkout URL
        const mockTransactionId = `mp_tx_${Math.random().toString(36).substring(2, 12)}`;
        const mockCheckoutUrl = `https://portal.mintpay.lk/checkout/${mockTransactionId}`;

        const payment = await Payment.create({
            user: user._id,
            order: orderId || undefined,
            stripePaymentIntentId: mockTransactionId, // Generic transaction id placeholder
            amount,
            currency: 'usd',
            status: 'pending',
            paymentMethod: 'Mintpay',
            paymentMethodDetails: {
                installmentsCount: 3,
                installmentAmount: Number(installmentAmount),
            }
        });

        return {
            success: true,
            transactionId: mockTransactionId,
            checkoutUrl: mockCheckoutUrl,
            paymentId: payment._id,
            installments: [
                { due: 'Today (Immediate)', amount: Number(installmentAmount) },
                { due: 'In 30 days', amount: Number(installmentAmount) },
                { due: 'In 60 days', amount: Number(installmentAmount) }
            ]
        };
    }

    async verifyTransaction(transactionId) {
        return {
            status: 'succeeded',
            paymentMethod: 'Mintpay',
            installmentsSettled: 1,
            installmentsRemaining: 2
        };
    }

    async refundTransaction(transactionId, amount) {
        return {
            success: true,
            refundId: `mp_ref_${Math.random().toString(36).substring(2, 12)}`,
            message: 'Simulated Mintpay refund processed successfully.'
        };
    }
}

module.exports = MintpayProvider;
