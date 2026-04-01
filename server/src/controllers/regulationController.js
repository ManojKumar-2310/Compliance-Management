const Regulation = require('../models/Regulation');
const Task = require('../models/Task');

// @desc    Get all regulations
// @route   GET /api/regulations
// @access  Private
const getRegulations = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Employee') {
            const tasks = await Task.find({ assignedTo: req.user._id }).select('regulationId');
            const regulationIds = tasks.map(t => t.regulationId).filter(id => id != null);
            query._id = { $in: regulationIds };
        }
        const regulations = await Regulation.find(query).populate('createdBy', 'name');
        res.json(regulations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get regulation by ID
// @route   GET /api/regulations/:id
// @access  Private
const getRegulationById = async (req, res) => {
    try {
        const regulation = await Regulation.findById(req.params.id).populate('createdBy', 'name');
        if (regulation) {
            // Role check: Employees can only view regulations associated with their tasks
            if (req.user.role === 'Employee') {
                const hasTask = await Task.exists({ assignedTo: req.user._id, regulationId: regulation._id });
                if (!hasTask) {
                    return res.status(403).json({ message: 'Not authorized to view this regulation' });
                }
            }
            res.json(regulation);
        } else {
            res.status(404).json({ message: 'Regulation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a regulation
// @route   POST /api/regulations
// @access  Private (Admin/Officer)
const createRegulation = async (req, res) => {
    const { title, description, category, effectiveDate, currentVersion } = req.body;

    try {
        const regulation = new Regulation({
            title,
            description,
            category,
            effectiveDate,
            currentVersion,
            createdBy: req.user._id,
            status: 'Draft'
        });

        const createdRegulation = await regulation.save();
        res.status(201).json(createdRegulation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update regulation (Create new version)
// @route   PUT /api/regulations/:id
// @access  Private (Admin/Officer)
const updateRegulation = async (req, res) => {
    const { title, description, category, effectiveDate, currentVersion, status } = req.body;

    try {
        const regulation = await Regulation.findById(req.params.id);

        if (regulation) {
            // Archive current state to versions if version changed or requested
            // For simplicity, we push current specific fields to history before updating
            if (currentVersion && currentVersion !== regulation.currentVersion) {
                regulation.versions.push({
                    version: regulation.currentVersion,
                    description: regulation.description, // Snapshot of old description
                    effectiveDate: regulation.effectiveDate,
                    updatedBy: req.user._id,
                    updatedAt: Date.now()
                });
            }

            regulation.title = title || regulation.title;
            regulation.description = description || regulation.description;
            regulation.category = category || regulation.category;
            regulation.effectiveDate = effectiveDate || regulation.effectiveDate;
            regulation.currentVersion = currentVersion || regulation.currentVersion;
            regulation.status = status || regulation.status;

            const updatedRegulation = await regulation.save();
            res.json(updatedRegulation);
        } else {
            res.status(404).json({ message: 'Regulation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete regulation
// @route   DELETE /api/regulations/:id
// @access  Private (Admin)
const deleteRegulation = async (req, res) => {
    try {
        const regulation = await Regulation.findById(req.params.id);

        if (regulation) {
            await regulation.deleteOne();
            res.json({ message: 'Regulation removed' });
        } else {
            res.status(404).json({ message: 'Regulation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRegulations,
    getRegulationById,
    createRegulation,
    updateRegulation,
    deleteRegulation,
};
