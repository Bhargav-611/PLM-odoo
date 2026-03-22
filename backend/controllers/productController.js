const productService = require('../services/productService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');

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
        const products = await productService.getAllProducts(req.user);
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

exports.getImageProxy = async (req, res) => {
    let { key } = req.query;
    if (!key) return res.status(400).send('Key required');

    if (key.startsWith('http')) {
        try { key = new URL(key).pathname.substring(1); } catch (e) {}
    }

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'plmodoo',
        Key: key
    });
    
    try {
        const response = await s3Client.send(command);
        res.setHeader('Content-Type', response.ContentType || 'image/jpeg');
        response.Body.pipe(res);
    } catch (err) {
        res.status(404).send('Not found');
    }
};
