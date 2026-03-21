// Created by Ghanshyam
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// @route   POST /api/products/create
// @desc    Create a new product and its initial version
router.post('/create', productController.createProduct);

// @route   GET /api/products
// @desc    Get all products with current version data
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID along with its current version
router.get('/:id', productController.getProductById);

// @route   GET /api/products/:id/history
// @desc    Get complete version history for a product
router.get('/:id/history', productController.getProductHistory);

// Exposing version creation for pure testing/simulating the ECO module
router.post('/:id/new-version', productController.createProductVersion);

module.exports = router;
