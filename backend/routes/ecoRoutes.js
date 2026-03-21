const express = require('express');
const router = express.Router();
const ecoController = require('../controllers/ecoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, ecoController.createECO);
router.put('/:id/approve-request', protect, ecoController.approveRequest);
router.put('/:id/edit', protect, ecoController.editECO);
router.put('/:id/send-final', protect, ecoController.sendFinalApproval);
router.get('/:id/compare', protect, ecoController.compareECO);
router.put('/:id/final-approve', protect, ecoController.finalApprove);
router.put('/:id/apply', protect, ecoController.applyECO);

router.get('/', protect, ecoController.getAllECO);

module.exports = router;
