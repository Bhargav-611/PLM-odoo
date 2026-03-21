const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('ENGINEER', 'ADMIN'), ecoController.createECO);
router.put('/:id/changes', protect, authorize('ENGINEER', 'ADMIN'), ecoController.updateChanges);
router.put('/:id/start', protect, authorize('ENGINEER', 'ADMIN'), ecoController.startReview);
router.put('/:id/approve', protect, authorize('APPROVER', 'ADMIN'), ecoController.approveECO);

module.exports = router;
