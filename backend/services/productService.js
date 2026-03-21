const Product = require('../models/Product');

exports.createProduct = async (productData) => {
    const product = new Product(productData);
    return await product.save();
};

exports.getProducts = async () => {
    return await Product.find({ status: { $ne: 'ARCHIVED' } });
};

exports.getProductById = async (id) => {
    return await Product.findById(id);
};
