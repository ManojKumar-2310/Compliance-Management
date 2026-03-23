const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
    description: String,
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open',
    },
});

const auditSchema = new mongoose.Schema({
    title: String,
    auditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    scope: String,
    findings: [findingSchema],
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
