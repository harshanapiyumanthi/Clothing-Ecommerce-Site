const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isStaff: { type: Boolean, default: false },
    message: { type: String, required: true }
}, { timestamps: true });

const supportTicketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: {
        type: String,
        enum: ['Order Issue', 'Customization', 'Return/Exchange', 'Payment', 'Membership', 'Other'],
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Waiting on Customer', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    messages: [messageSchema],
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internalNotes: { type: String, default: '' },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
module.exports = SupportTicket;
