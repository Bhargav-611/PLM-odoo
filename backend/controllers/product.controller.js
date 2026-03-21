// Created by Ghanshyam
const productService = require('../services/product.service');

exports.createProduct = async (req, res) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductHistory = async (req, res) => {
    try {
        const history = await productService.getProductHistory(req.params.id);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Endpoint for testing version creation manually (the requirements state ECO logic calls this service,
 * but it's handy to have it exposed for testing or if direct update is needed for the flow)
 */
exports.createProductVersion = async (req, res) => {
    try {
        const newVersion = await productService.createNewProductVersion(req.params.id, req.body);
        res.status(201).json({ success: true, data: newVersion });
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};
