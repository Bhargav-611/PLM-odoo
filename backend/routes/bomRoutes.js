const express = require('express');
const router = express.Router();
const bomController = require('../controllers/bomController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/create', protect, checkRole('ADMIN'), bomController.createBOM);
router.get('/', protect, bomController.getAllBOMs);
router.get('/:id/versions', protect, bomController.getBOMVersions);
router.delete('/:id', protect, checkRole('ADMIN'), bomController.deleteBOM);

module.exports = router;
