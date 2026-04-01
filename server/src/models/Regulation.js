const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    version: String,
    description: String,
    effectiveDate: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

const regulationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    effectiveDate: {
        type: Date,
        required: true,
    },
    versions: [versionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Regulation', regulationSchema);
