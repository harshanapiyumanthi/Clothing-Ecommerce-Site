const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true }, // e.g. 'Product Deleted', 'Price Changed'
    target: { type: String, required: true }, // e.g. 'Product', 'Order', 'Membership'
    targetId: { type: String },
    details: { type: String }, // Human-readable summary
    ip: { type: String },
}, { timestamps: true });

// Index for efficient querying
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ admin: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
