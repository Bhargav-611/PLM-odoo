const express = require('express');
const router = express.Router();
const bomController = require('../controllers/bomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, bomController.createBOM);
router.get('/', protect, bomController.getAllBOMs);
router.get('/:id/versions', protect, bomController.getBOMVersions);
router.delete('/:id', protect, bomController.deleteBOM);

module.exports = router;
