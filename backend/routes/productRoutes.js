const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, productController.getProducts);
router.post('/', protect, authorize('ENGINEER', 'ADMIN'), productController.createProduct);

module.exports = router;
