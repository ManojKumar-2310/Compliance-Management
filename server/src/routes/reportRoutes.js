const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getTaskChartData,
    getDetailedReportStats,
    exportTaskReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', authorize('Admin', 'Manager', 'Compliance Officer', 'Auditor', 'Employee'), getDashboardStats);
router.get('/detailed', authorize('Admin', 'Manager', 'Compliance Officer', 'Auditor', 'Employee'), getDetailedReportStats);
router.get('/charts/tasks', authorize('Admin', 'Manager', 'Compliance Officer', 'Auditor', 'Employee'), getTaskChartData);
router.get('/export', authorize('Admin', 'Manager', 'Compliance Officer', 'Auditor', 'Employee'), exportTaskReport);

module.exports = router;
