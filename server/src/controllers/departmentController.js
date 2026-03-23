const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).select('name description');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDepartments };
