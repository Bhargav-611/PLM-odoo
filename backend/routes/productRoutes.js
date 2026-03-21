const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', protect, productController.getProducts);
router.post('/', protect, checkRole('ENGINEER', 'ADMIN'), productController.createProduct);

module.exports = router;
