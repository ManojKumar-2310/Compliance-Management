const express = require('express');
const router = express.Router();
const {
    createMission,
    getMissions,
    getMission,
    updateMission,
    deleteMission
} = require('../controllers/missionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getMissions)
    .post(authorize('Admin'), createMission);

router.route('/:id')
    .get(getMission)
    .patch(authorize('Admin'), updateMission)
    .delete(authorize('Admin'), deleteMission);

module.exports = router;
