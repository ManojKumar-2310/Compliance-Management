const User = require('../models/User');
const Regulation = require('../models/Regulation');
const Task = require('../models/Task');
const Audit = require('../models/Audit');
const Risk = require('../models/Risk');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private (Admin/Manager/Officer)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRegulations = await Regulation.countDocuments();
        const activeRegulations = await Regulation.countDocuments({ status: 'Active' });

        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: 'Pending' });
        const overdueTasks = await Task.countDocuments({ status: 'Overdue' });
        const completedTasks = await Task.countDocuments({ status: 'Completed' });

        const totalAudits = await Audit.countDocuments();
        const openAudits = await Audit.countDocuments({ status: { $in: ['Scheduled', 'In Progress'] } });

        const highRisks = await Risk.countDocuments({ severity: { $in: ['High', 'Critical'] }, status: { $ne: 'Closed' } });

        // Calculate Compliance Percentage (Simple logic: Completed Tasks / Total Tasks)
        const compliancePercentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

        // Task status by assignee (Employee Work)
        const assigneeStats = await Task.aggregate([
            {
                $group: {
                    _id: "$assignedTo",
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    name: "$userInfo.name",
                    role: "$userInfo.role",
                    completed: 1,
                    total: 1
                }
            },
            { $limit: 5 } // Top 5 assigned employees
        ]);

        res.json({
            counts: {
                users: totalUsers,
                regulations: { total: totalRegulations, active: activeRegulations },
                tasks: { total: totalTasks, pending: pendingTasks, overdue: overdueTasks, completed: completedTasks },
                audits: { total: totalAudits, open: openAudits },
                risks: { high: highRisks }
            },
            compliancePercentage,
            assigneeStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get data for charts (e.g., Task status distribution)
// @route   GET /api/reports/charts/tasks
// @access  Private
const getTaskChartData = async (req, res) => {
    try {
        const stats = await Task.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed compliance health by regulation
// @route   GET /api/reports/detailed
// @access  Private (Admin/Auditor)
const getDetailedReportStats = async (req, res) => {
    try {
        const regulations = await Regulation.find({ status: 'Active' });

        const detailedStats = await Promise.all(regulations.map(async (reg) => {
            const totalTasks = await Task.countDocuments({ regulationId: reg._id });
            const approvedTasks = await Task.countDocuments({ regulationId: reg._id, status: 'Approved' });
            const overdueTasks = await Task.countDocuments({ regulationId: reg._id, status: 'Overdue' });

            // Get latest audit remarks for this regulation's tasks
            const latestTaskWithRemarks = await Task.findOne({
                regulationId: reg._id,
                "auditFeedback.remarks": { $exists: true, $ne: "" }
            }).sort({ updatedAt: -1 });

            return {
                _id: reg._id,
                title: reg.title,
                category: reg.category,
                stats: {
                    total: totalTasks,
                    approved: approvedTasks,
                    overdue: overdueTasks,
                    health: totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0
                },
                latestRemarks: latestTaskWithRemarks?.auditFeedback?.remarks || "No recent audit remarks"
            };
        }));

        res.json(detailedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export compliance tasks to CSV
// @route   GET /api/reports/export
// @access  Private (Admin/Auditor)
const exportTaskReport = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('regulationId', 'title category')
            .populate('assignedTo', 'name')
            .populate('auditFeedback.auditor', 'name');

        let csv = 'Title,Regulation,Category,Priority,Status,Assignee,Completed At,Auditor,Remarks\n';

        tasks.forEach(task => {
            const completedAt = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A';
            const auditorName = task.auditFeedback?.auditor?.name || 'N/A';
            const remarks = (task.auditFeedback?.remarks || '').replace(/,/g, ';'); // Prevent CSV break

            csv += `"${task.title}","${task.regulationId?.title || 'N/A'}","${task.regulationId?.category || 'N/A'}","${task.priority}","${task.status}","${task.assignedTo?.name || 'N/A'}","${completedAt}","${auditorName}","${remarks}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getTaskChartData,
    getDetailedReportStats,
    exportTaskReport
};
