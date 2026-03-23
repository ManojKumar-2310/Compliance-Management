const User = require('../models/User');
const Task = require('../models/Task');
const Regulation = require('../models/Regulation');
const Audit = require('../models/Audit');
const Risk = require('../models/Risk');
const ActivityLog = require('../models/ActivityLog');

const analyticsController = {
    // Get overview stats for admin dashboard
    getOverviewStats: async (req, res) => {
        try {
            const [
                totalUsers,
                activeTasks,
                completedTasks,
                totalRegulations
            ] = await Promise.all([
                User.countDocuments({ isActive: true }),
                Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
                Task.countDocuments({ status: 'Completed' }),
                Regulation.countDocuments({ status: 'Active' })
            ]);

            // Calculate compliance score (Approved tasks / total tasks)
            const [approvedTasks, totalTasks] = await Promise.all([
                Task.countDocuments({ auditStatus: 'Approved' }),
                Task.countDocuments()
            ]);

            const complianceScore = totalTasks > 0
                ? ((approvedTasks / totalTasks) * 100).toFixed(1)
                : 0;

            res.json({
                success: true,
                data: {
                    totalUsers,
                    activeTasks,
                    completedTasks,
                    totalRegulations,
                    complianceScore,
                    trend: {
                        users: '+5%',
                        tasks: '-2%',
                        compliance: '+12%',
                        regulations: '+3%'
                    }
                }
            });
        } catch (error) {
            console.error('Analytics overview error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching overview stats'
            });
        }
    },

    // Get compliance score trend over time
    getComplianceScore: async (req, res) => {
        try {
            const { days = 30 } = req.query;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            const tasks = await Task.find({
                createdAt: { $gte: startDate }
            }).select('status createdAt completedAt');

            // Group by day and calculate completion rate
            const dailyStats = {};

            tasks.forEach(task => {
                const date = task.createdAt.toISOString().split('T')[0];
                if (!dailyStats[date]) {
                    dailyStats[date] = { total: 0, completed: 0 };
                }
                dailyStats[date].total++;
                if (task.status === 'Completed') {
                    dailyStats[date].completed++;
                }
            });

            const chartData = Object.keys(dailyStats).map(date => ({
                date,
                score: ((dailyStats[date].completed / dailyStats[date].total) * 100).toFixed(1),
                completed: dailyStats[date].completed,
                total: dailyStats[date].total
            }));

            res.json({
                success: true,
                data: chartData
            });
        } catch (error) {
            console.error('Compliance score error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching compliance score'
            });
        }
    },

    // Get task completion statistics
    getTaskCompletion: async (req, res) => {
        try {
            const stats = await Task.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const formattedStats = {
                pending: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0
            };

            stats.forEach(stat => {
                if (stat._id === 'Pending') formattedStats.pending = stat.count;
                if (stat._id === 'In Progress') formattedStats.inProgress = stat.count;
                if (stat._id === 'Completed') formattedStats.completed = stat.count;
            });

            // Count overdue tasks
            formattedStats.overdue = await Task.countDocuments({
                status: { $ne: 'Completed' },
                dueDate: { $lt: new Date() }
            });

            res.json({
                success: true,
                data: formattedStats
            });
        } catch (error) {
            console.error('Task completion error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching task completion stats'
            });
        }
    },

    // Get department-wise statistics
    getDepartmentStats: async (req, res) => {
        try {
            const stats = await Task.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignee'
                    }
                },
                { $unwind: '$assignee' },
                {
                    $group: {
                        _id: '$assignee.department',
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        department: '$_id',
                        total: 1,
                        completed: 1,
                        completionRate: {
                            $multiply: [
                                { $divide: ['$completed', '$total'] },
                                100
                            ]
                        }
                    }
                }
            ]);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Department stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching department stats'
            });
        }
    },

    // Get recent activity logs
    getRecentActivity: async (req, res) => {
        try {
            const logs = await ActivityLog.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('user', 'name email role');

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Recent activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching recent activity'
            });
        }
    }
};

module.exports = analyticsController;
