const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(authorize('Admin', 'Manager', 'Compliance Officer'), createTask);

router.route('/:id')
    .get(getTaskById)
    .put(updateTask) // Logic inside controller handles granular permissions
    .delete(authorize('Admin', 'Manager'), deleteTask);

module.exports = router;
