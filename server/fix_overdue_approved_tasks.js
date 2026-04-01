/**
 * One-time repair script:
 * Restores tasks that were incorrectly set to 'Overdue' by the cron job
 * even though they had already been Approved or Rejected by the auditor.
 *
 * Run: node fix_overdue_approved_tasks.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Register ALL referenced models before querying
require('./src/models/User');
require('./src/models/Regulation');
const Task = require('./src/models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compliance_db';

async function fixTasks() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all tasks that:
    // 1. Are currently 'Overdue'
    // 2. Have an auditFeedback.decisionDate (meaning auditor already reviewed them)
    const damagedTasks = await Task.find({
        status: 'Overdue',
        'auditFeedback.decisionDate': { $exists: true }
    }).populate('assignedTo', 'name');

    if (damagedTasks.length === 0) {
        console.log('No damaged tasks found. All data is clean!');
        await mongoose.disconnect();
        return;
    }

    console.log(`Found ${damagedTasks.length} task(s) incorrectly marked as Overdue after auditor review:`);
    for (const task of damagedTasks) {
        console.log(`  - "${task.title}" (Assigned to: ${task.assignedTo?.name || 'Unknown'})`);
    }

    // Restore them all to 'Approved' (since auditor reviewed = approved in this context)
    const result = await Task.updateMany(
        {
            status: 'Overdue',
            'auditFeedback.decisionDate': { $exists: true }
        },
        { $set: { status: 'Approved' } }
    );

    console.log(`\nFixed ${result.modifiedCount} task(s) - status restored to 'Approved'.`);
    await mongoose.disconnect();
    console.log('Done!');
}

fixTasks().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
