const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin role
router.use(protect);
router.use(authorize('Admin'));

// @route   GET /api/analytics/overview
// @desc    Get overview statistics for dashboard
// @access  Admin
router.get('/overview', analyticsController.getOverviewStats);

// @route   GET /api/analytics/compliance-score
// @desc    Get compliance score trend
// @access  Admin
router.get('/compliance-score', analyticsController.getComplianceScore);

// @route   GET /api/analytics/task-completion
// @desc    Get task completion statistics
// @access  Admin
router.get('/task-completion', analyticsController.getTaskCompletion);

// @route   GET /api/analytics/department-stats
// @desc    Get department-wise statistics
// @access  Admin
router.get('/department-stats', analyticsController.getDepartmentStats);

// @route   GET /api/analytics/activity
// @desc    Get recent activity logs
// @access  Admin
router.get('/activity', analyticsController.getRecentActivity);

// @route   GET /api/analytics/trend
// @desc    Get compliance score trend
// @access  Admin
router.get('/trend', analyticsController.getComplianceScore);

module.exports = router;
