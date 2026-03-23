const Audit = require('../models/Audit');

// @desc    Get all audits
// @route   GET /api/audits
// @access  Private
const getAudits = async (req, res) => {
    try {
        const audits = await Audit.find({}).populate('auditor', 'name');
        res.json(audits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit by ID
// @route   GET /api/audits/:id
// @access  Private
const getAuditById = async (req, res) => {
    try {
        const audit = await Audit.findById(req.params.id).populate('auditor', 'name');
        if (audit) {
            res.json(audit);
        } else {
            res.status(404).json({ message: 'Audit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an audit
// @route   POST /api/audits
// @access  Private (Officer/Admin)
const createAudit = async (req, res) => {
    const { title, auditor, date, scope, status } = req.body;

    try {
        const audit = await Audit.create({
            title,
            auditor,
            date,
            scope,
            status,
        });
        res.status(201).json(audit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update audit (Add findings, change status)
// @route   PUT /api/audits/:id
// @access  Private (Officer/Admin/Auditor)
const updateAudit = async (req, res) => {
    try {
        const audit = await Audit.findById(req.params.id);

        if (audit) {
            audit.title = req.body.title || audit.title;
            audit.auditor = req.body.auditor || audit.auditor;
            audit.date = req.body.date || audit.date;
            audit.scope = req.body.scope || audit.scope;
            audit.status = req.body.status || audit.status;

            if (req.body.findings) {
                // Replace or append? Assuming replace/full update of findings array for now
                // In a real app, might want specific endpoints for adding findings
                audit.findings = req.body.findings;
            }

            const updatedAudit = await audit.save();
            res.json(updatedAudit);
        } else {
            res.status(404).json({ message: 'Audit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAudits,
    getAuditById,
    createAudit,
    updateAudit,
};
