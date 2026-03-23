const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['Task Assigned', 'Deadline Warning', 'Audit Result', 'System Alert'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String, // URL or route to redirect
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
