const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
    missionObjective: {
        type: String,
        required: [true, 'Mission objective is required'],
        trim: true
    },
    tacticalIntelligence: {
        type: String,
        required: [true, 'Tactical intelligence is required'],
        trim: true
    },
    protocol: {
        type: String,
        required: [true, 'Regulatory protocol is required']
    },
    assignedSpecialist: {
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    threatLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    missionStatus: {
        type: String,
        enum: ['Pending', 'In Progress', 'Submitted', 'Completed'],
        default: 'Pending'
    },
    deadline: {
        type: Date,
        required: [true, 'Mission deadline is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mission', missionSchema);
