const productService = require('../services/productService');

exports.createProduct = async (req, res) => {
    try {
        const result = await productService.createProduct(req.body, req.files, req.user.id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getProductHistory = async (req, res) => {
    try {
        const history = await productService.getProductHistory(req.params.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createNewVersion = async (req, res) => {
    try {
        const result = await productService.createNewProductVersion(req.params.id, req.body, req.files, req.user.id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.user);
        res.json({ message: 'Product architecture purged.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
