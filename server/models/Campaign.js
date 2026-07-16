const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    targetSegment: {
        type: String,
        enum: ['All', 'New Customers', 'VIP', 'Inactive', 'Premium Members', 'Custom'],
        default: 'All'
    },
    status: {
        type: String,
        enum: ['Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    channel: {
        type: String,
        enum: ['Email', 'SMS', 'Push', 'In-App'],
        default: 'In-App'
    },
    templateRef: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
    customMessage: { type: String },
    scheduledAt: { type: Date },
    metrics: {
        sent: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        converted: { type: Number, default: 0 }
    }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
