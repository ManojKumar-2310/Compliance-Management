const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details, req) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            details,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            metadata: {
                userAgent: req?.headers['user-agent'],
                method: req?.method,
                path: req?.originalUrl
            }
        });
    } catch (error) {
        console.error('Activity Log Error:', error);
    }
};

module.exports = logActivity;
