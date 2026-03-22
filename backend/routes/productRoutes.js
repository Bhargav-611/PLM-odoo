const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 10 }
]);

router.post('/create', protect, checkRole('ADMIN'), uploadFields, productController.createProduct);
router.get('/', protect, productController.getProducts); // Anyone authenticated can read
router.get('/image-proxy', productController.getImageProxy);
router.get('/:id', protect, productController.getProductById);
router.get('/:id/history', protect, productController.getProductHistory);

// Manual iteration endpoint (restricted to engineers/admins)
router.post('/:id/version', protect, checkRole('ENGINEER', 'ADMIN'), uploadFields, productController.createNewVersion);
router.delete('/:id', protect, checkRole('ADMIN'), productController.deleteProduct);

module.exports = router;
