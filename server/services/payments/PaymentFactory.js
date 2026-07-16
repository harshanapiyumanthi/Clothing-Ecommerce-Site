const StripeProvider = require('./StripeProvider');
const MintpayProvider = require('./MintpayProvider');
const FlexProvider = require('./FlexProvider');
const CodProvider = require('./CodProvider');

class PaymentFactory {
    static getProvider(methodName) {
        switch (methodName?.toUpperCase()) {
            case 'STRIPE':
            case 'CREDIT_CARD':
            case 'CARD':
                return new StripeProvider();
            case 'MINTPAY':
                return new MintpayProvider();
            case 'FLEX':
                return new FlexProvider();
            case 'COD':
            case 'CASH_ON_DELIVERY':
                return new CodProvider();
            default:
                throw new Error(`Unsupported payment method: ${methodName}`);
        }
    }
}

module.exports = PaymentFactory;
