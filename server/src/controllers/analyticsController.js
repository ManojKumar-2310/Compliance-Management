const User = require('../models/User');
const Task = require('../models/Task');
const Regulation = require('../models/Regulation');
const Audit = require('../models/Audit');
const Risk = require('../models/Risk');
const ActivityLog = require('../models/ActivityLog');
const Mission = require('../models/Mission');

const analyticsController = {
    // Get overview stats for admin dashboard
    getOverviewStats: async (req, res) => {
        try {
            const [
                totalUsers,
                totalRegulations,
                activeTasksCount,
                completedTasksCount,
                activeMissionsCount,
                completedMissionsCount,
                approvedTasksCount,
                totalTasksCount,
                totalMissionsCount
            ] = await Promise.all([
                User.countDocuments({ isActive: { $ne: false } }),
                Regulation.countDocuments({ status: 'Active' }),
                Task.countDocuments({ status: { $in: ['Pending', 'In Progress', 'Submitted', 'Under Review'] } }),
                Task.countDocuments({ status: { $in: ['Completed', 'Approved'] } }),
                Mission.countDocuments({ missionStatus: { $in: ['Pending', 'In Progress', 'Submitted'] } }),
                Mission.countDocuments({ missionStatus: 'Completed' }),
                Task.countDocuments({ status: 'Approved' }),
                Task.countDocuments(),
                Mission.countDocuments()
            ]);

            const activeTasks = activeTasksCount + activeMissionsCount;
            const completedTasks = completedTasksCount + completedMissionsCount;

            // Calculate compliance score
            const totalWork = totalTasksCount + totalMissionsCount;
            const approvedWork = approvedTasksCount + completedMissionsCount;

            const complianceScore = totalWork > 0
                ? ((approvedWork / totalWork) * 100).toFixed(1)
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

            const [tasks, missions] = await Promise.all([
                Task.find({ createdAt: { $gte: startDate } }).select('status createdAt'),
                Mission.find({ createdAt: { $gte: startDate } }).select('missionStatus createdAt')
            ]);

            // Group by day and calculate completion rate
            const dailyStats = {};

            tasks.forEach(task => {
                const date = task.createdAt.toISOString().split('T')[0];
                if (!dailyStats[date]) dailyStats[date] = { total: 0, completed: 0 };
                dailyStats[date].total++;
                if (['Completed', 'Approved'].includes(task.status)) dailyStats[date].completed++;
            });

            missions.forEach(mission => {
                const date = mission.createdAt.toISOString().split('T')[0];
                if (!dailyStats[date]) dailyStats[date] = { total: 0, completed: 0 };
                dailyStats[date].total++;
                if (mission.missionStatus === 'Completed') dailyStats[date].completed++;
            });

            const chartData = Object.keys(dailyStats).sort().map(date => ({
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
            const [taskStats, missionStats] = await Promise.all([
                Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
                Mission.aggregate([{ $group: { _id: '$missionStatus', count: { $sum: 1 } } }])
            ]);

            const formattedStats = {
                pending: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0
            };

            taskStats.forEach(stat => {
                if (stat._id === 'Pending') formattedStats.pending += stat.count;
                if (stat._id === 'In Progress') formattedStats.inProgress += stat.count;
                if (['Completed', 'Approved'].includes(stat._id)) formattedStats.completed += stat.count;
            });

            missionStats.forEach(stat => {
                if (stat._id === 'Pending') formattedStats.pending += stat.count;
                if (stat._id === 'In Progress') formattedStats.inProgress += stat.count;
                if (stat._id === 'Submitted') formattedStats.inProgress += stat.count;
                if (stat._id === 'Completed') formattedStats.completed += stat.count;
            });

            // Count overdue tasks
            const overdueTasks = await Task.countDocuments({
                status: { $nin: ['Completed', 'Approved'] },
                dueDate: { $lt: new Date() }
            });

            // Note: Missions don't have a clear overdue field but we could check deadline
            const overdueMissions = await Mission.countDocuments({
                missionStatus: { $ne: 'Completed' },
                deadline: { $lt: new Date() }
            });

            formattedStats.overdue = overdueTasks + overdueMissions;

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
            // 1. Get Task Stats by Department
            const taskStats = await Task.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignee'
                    }
                },
                { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: false } },
                {
                    $group: {
                        _id: '$assignee.department',
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $in: ['$status', ['Completed', 'Approved']] }, 1, 0] }
                        }
                    }
                }
            ]);

            // 2. Get Mission Stats by Department (Match by specialist name)
            const missionStats = await Mission.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'assignedSpecialist.name',
                        foreignField: 'name',
                        as: 'assignee'
                    }
                },
                { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: false } },
                {
                    $group: {
                        _id: '$assignee.department',
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$missionStatus', 'Completed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            // 3. Combine Stats
            const combined = {};
            
            taskStats.forEach(s => {
                const dept = s._id || 'General';
                if (!combined[dept]) combined[dept] = { total: 0, completed: 0 };
                combined[dept].total += s.total;
                combined[dept].completed += s.completed;
            });

            missionStats.forEach(s => {
                const dept = s._id || 'General';
                if (!combined[dept]) combined[dept] = { total: 0, completed: 0 };
                combined[dept].total += s.total;
                combined[dept].completed += s.completed;
            });

            const finalStats = Object.keys(combined).map(dept => ({
                department: dept,
                total: combined[dept].total,
                completed: combined[dept].completed,
                completionRate: combined[dept].total > 0 
                    ? Math.round((combined[dept].completed / combined[dept].total) * 100)
                    : 0
            }));

            res.json({
                success: true,
                data: finalStats
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
