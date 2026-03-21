const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, ecoController.createECO);
router.put('/:id/edit', protect, ecoController.editECO);
router.post('/:id/submit', protect, ecoController.submitECOForApproval);
router.post('/:id/assign-approvers', protect, ecoController.assignApprovers);
router.post('/:id/approve', protect, ecoController.approveECO);
router.post('/:id/reject', protect, ecoController.rejectECO);
router.post('/:id/apply', protect, ecoController.applyECOChanges);
router.get('/:id/compare', protect, ecoController.compareECO);

router.get('/', protect, ecoController.getAllECO);

module.exports = router;
