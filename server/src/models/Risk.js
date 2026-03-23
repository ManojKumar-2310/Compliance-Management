const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Identified', 'Mitigated', 'Acceptable', 'Closed'],
        default: 'Identified',
    },
    identifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    mitigationPlan: String,
}, { timestamps: true });

module.exports = mongoose.model('Risk', riskSchema);
