const cron = require('node-cron');
const Task = require('../models/Task');

const startCronJobs = () => {
    // Run every day at midnight (0 0 * * *)
    // For demo purposes, we can run it every hour (0 * * * *)
    cron.schedule('0 * * * *', async () => {
        console.log('Running Overdue Task Check...');
        try {
            const now = new Date();
            const result = await Task.updateMany(
                {
                    // Exclude ALL terminal statuses — Approved/Rejected tasks must never be overwritten
                    status: { $nin: ['Completed', 'Approved', 'Rejected'] },
                    dueDate: { $lt: now }
                },
                { $set: { status: 'Overdue' } }
            );
            console.log(`Overdue check complete. Updated ${result.modifiedCount} tasks.`);
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = startCronJobs;
