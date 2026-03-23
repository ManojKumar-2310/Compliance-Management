const Mission = require('../models/Mission');

// @desc    Create new mission
// @route   POST /api/mission
// @access  Private/Admin
exports.createMission = async (req, res) => {
    try {
        const mission = await Mission.create(req.body);

        res.status(201).json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all missions
// @route   GET /api/mission
// @access  Private/Admin
exports.getMissions = async (req, res) => {
    try {
        const missions = await Mission.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: missions.length,
            data: missions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single mission
// @route   GET /api/mission/:id
// @access  Private
exports.getMission = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);

        if (!mission) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        res.status(200).json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update mission
// @route   PATCH /api/mission/:id
// @access  Private/Admin
exports.updateMission = async (req, res) => {
    try {
        const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!mission) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        res.status(200).json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete mission
// @route   DELETE /api/mission/:id
// @access  Private/Admin
exports.deleteMission = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);

        if (!mission) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        await mission.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
