const express = require('express');
const router = express.Router();
const {
    getAudits,
    getAuditById,
    createAudit,
    updateAudit,
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAudits)
    .post(authorize('Admin', 'Compliance Officer', 'Auditor'), createAudit);

router.route('/:id')
    .get(getAuditById)
    .put(authorize('Admin', 'Compliance Officer', 'Auditor'), updateAudit); // Manager might need to update findings if they are the auditor? Check roles.

// Simplified for now: Officer manages Audits.

module.exports = router;
