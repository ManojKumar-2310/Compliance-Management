const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true, // e.g., "LOGIN", "CREATE_TASK", "DELETE_REGULATION"
    },
    details: {
        type: String, // Human readable description
    },
    ipAddress: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Store any related object IDs or data snapshots
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
