const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/', protect, checkRole('ENGINEER', 'ADMIN'), ecoController.createECO);
router.put('/:id/changes', protect, checkRole('ENGINEER', 'ADMIN'), ecoController.updateChanges);
router.put('/:id/start', protect, checkRole('ENGINEER', 'ADMIN'), ecoController.startReview);
router.put('/:id/approve', protect, checkRole('APPROVER', 'ADMIN'), ecoController.approveECO);

module.exports = router;
