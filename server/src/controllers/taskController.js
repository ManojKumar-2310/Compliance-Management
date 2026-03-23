const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        let query = { ...req.query };
        // Emplooyees only see their tasks
        if (req.user.role === 'Employee') {
            query.assignedTo = req.user._id;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('regulationId', 'title')
            .populate('evidence');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name')
            .populate('regulationId', 'title')
            .populate('evidence');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Role check: Employees can only view their own tasks
        if (req.user.role === 'Employee' && task.assignedTo._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this task' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (Manager/Admin/Officer)
const createTask = async (req, res) => {
    const { title, description, regulationId, assignedTo, dueDate, priority } = req.body;

    try {
        const task = await Task.create({
            title,
            description,
            regulationId,
            assignedTo,
            assignedBy: req.user._id,
            dueDate,
            priority,
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name')
            .populate('regulationId', 'title');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task (Status, Evidence)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Permission check needs refinement based on specific updates
        // For now allowing:
        // - Admin/Manager/Officer: Update anything
        // - Employee: Only update status to "Completed" and add Evidence if assigned to them

        // Check if assignedTo exists to prevent crash
        const assignedToId = task.assignedTo ? task.assignedTo.toString() : null;
        const isAssignee = assignedToId && req.user._id.toString() === assignedToId;
        const isAuthorizedRole = ['Admin', 'Compliance Officer', 'Auditor', 'Manager'].includes(req.user.role);

        if (!isAssignee && !isAuthorizedRole) {
            return res.status(403).json({ message: 'Not authorized to modify this task' });
        }

        if (req.user.role === 'Employee') {
            // STEP 4: Employee specific updates
            if (req.body.status) task.status = req.body.status;
            if (req.body.evidence) task.evidence = req.body.evidence;
            if (req.body.status === 'Completed') task.completedAt = Date.now();
        } else {
            // STEP 3: Admin/CO/Auditor updates
            task.title = req.body.title || task.title;
            task.description = req.body.description || task.description;
            task.assignedTo = req.body.assignedTo || task.assignedTo;
            task.dueDate = req.body.dueDate || task.dueDate;
            task.priority = req.body.priority || task.priority;
            task.status = req.body.status || task.status;
            task.evidence = req.body.evidence || task.evidence;

            // Handle audit feedback
            if (req.body.auditFeedback) {
                task.auditFeedback = {
                    ...task.auditFeedback,
                    ...req.body.auditFeedback,
                    auditor: req.user._id, // Auto-assign current user as auditor
                    decisionDate: Date.now()
                };
            }
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            await task.deleteOne();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
