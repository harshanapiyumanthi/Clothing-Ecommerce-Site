const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['Welcome', 'OrderConfirmation', 'Shipping', 'Birthday', 'Membership', 'Promotion', 'ReviewRequest', 'Custom'],
        required: true
    },
    subject: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    variables: [{ type: String }], // e.g., 'userName', 'orderId', 'discountCode'
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
module.exports = EmailTemplate;
