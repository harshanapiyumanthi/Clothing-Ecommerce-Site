class PaymentProvider {
    /**
     * Create a payment/transaction intent
     * @param {Object} user - The mongoose user object
     * @param {number} amount - Total amount of transaction
     * @param {string} orderId - Associated order ID
     * @returns {Promise<Object>} - Contains success state and gateway details (secrets, ids)
     */
    async createTransaction(user, amount, orderId) {
        throw new Error('createTransaction must be implemented');
    }

    /**
     * Verify transaction status
     * @param {string} transactionId - Gateway transaction ID
     * @returns {Promise<Object>} - Payment status object
     */
    async verifyTransaction(transactionId) {
        throw new Error('verifyTransaction must be implemented');
    }

    /**
     * Refund a successful transaction
     * @param {string} transactionId - Gateway transaction ID
     * @param {number} amount - Amount to refund
     * @returns {Promise<Object>} - Refund transaction details
     */
    async refundTransaction(transactionId, amount) {
        throw new Error('refundTransaction must be implemented');
    }
}

module.exports = PaymentProvider;
