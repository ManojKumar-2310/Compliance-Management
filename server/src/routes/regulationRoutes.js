const express = require('express');
const router = express.Router();
const {
    getRegulations,
    getRegulationById,
    createRegulation,
    updateRegulation,
    deleteRegulation,
} = require('../controllers/regulationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getRegulations)
    .post(authorize('Admin', 'Compliance Officer'), createRegulation);

router.route('/:id')
    .get(getRegulationById)
    .put(authorize('Admin', 'Compliance Officer'), updateRegulation)
    .delete(authorize('Admin'), deleteRegulation);

module.exports = router;
