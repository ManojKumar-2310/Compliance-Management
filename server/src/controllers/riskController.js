const Risk = require('../models/Risk');

// @desc    Get all risks
// @route   GET /api/risks
// @access  Private
const getRisks = async (req, res) => {
    try {
        const risks = await Risk.find({}).populate('identifiedBy', 'name');
        res.json(risks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a risk
// @route   POST /api/risks
// @access  Private
const createRisk = async (req, res) => {
    const { title, description, category, severity, status, mitigationPlan } = req.body;

    try {
        const risk = await Risk.create({
            title,
            description,
            category,
            severity,
            status,
            mitigationPlan,
            identifiedBy: req.user._id,
        });
        res.status(201).json(risk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update risk
// @route   PUT /api/risks/:id
// @access  Private
const updateRisk = async (req, res) => {
    try {
        const risk = await Risk.findById(req.params.id);

        if (risk) {
            risk.title = req.body.title || risk.title;
            risk.description = req.body.description || risk.description;
            risk.category = req.body.category || risk.category;
            risk.severity = req.body.severity || risk.severity;
            risk.status = req.body.status || risk.status;
            risk.mitigationPlan = req.body.mitigationPlan || risk.mitigationPlan;

            const updatedRisk = await risk.save();
            res.json(updatedRisk);
        } else {
            res.status(404).json({ message: 'Risk not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRisks,
    createRisk,
    updateRisk,
};
