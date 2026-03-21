const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/eco', protect, reportController.getEcoReport);
router.get('/logs', protect, reportController.getAuditLogs);

module.exports = router;
