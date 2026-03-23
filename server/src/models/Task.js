const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    regulationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Regulation',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Overdue'],
        default: 'Pending',
    },
    // Support multiple evidence documents
    evidence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
    }],
    auditFeedback: {
        remarks: String,
        auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        decisionDate: Date
    },
    completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
