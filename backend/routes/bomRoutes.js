const express = require('express');
const router = express.Router();
const bomController = require('../controllers/bomController');

router.post('/create-draft', bomController.createDraft);
router.get('/product/:productId', bomController.getBoMsByProduct);
router.put('/update-draft/:id', bomController.updateDraft);
router.post('/send-for-approval/:id', bomController.sendForApproval);
router.post('/approve/:id', bomController.approve);
router.post('/reject/:id', bomController.reject);
router.get('/compare/:id', bomController.compare);

module.exports = router;
