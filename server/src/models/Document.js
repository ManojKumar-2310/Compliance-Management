const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    mimeType: String,
    size: Number,
    path: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relatedEntity: {
        type: String,
        enum: ['Task', 'Regulation', 'Audit', 'Risk'],
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
