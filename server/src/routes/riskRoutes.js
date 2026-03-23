const express = require('express');
const router = express.Router();
const {
    getRisks,
    createRisk,
    updateRisk,
} = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getRisks)
    .post(createRisk);

router.route('/:id')
    .put(authorize('Admin', 'Compliance Officer', 'Manager'), updateRisk);

module.exports = router;
