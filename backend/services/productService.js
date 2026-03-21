const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductVersion = require('../models/ProductVersion');

exports.createProduct = async (data, files, userId) => {
    if (!data.name) throw new Error("Product name required");
    if (isNaN(data.salePrice) || isNaN(data.costPrice)) throw new Error("Invalid price");

    try {
        const product = await Product.create({
            name: data.name,
            isActive: true,
            createdBy: userId
        });

        const image = files?.image?.[0]?.location || null;
        const attachments = files?.attachments?.map(f => ({
            url: f.location,
            name: f.originalname
        })) || [];

        const productVersion = await ProductVersion.create({
            productId: product._id,
            versionNumber: 1,
            versionLabel: 'v1',
            salePrice: Number(data.salePrice),
            costPrice: Number(data.costPrice),
            image,
            attachments,
            status: 'ACTIVE',
            createdBy: userId,
            updatedBy: userId
        });

        product.currentVersionId = productVersion._id;
        await product.save();

        return { product, version: productVersion };
    } catch (err) {
        throw err;
    }
};

exports.getAllProducts = async (user) => {
    const filter = user?.role === 'ADMIN' ? {} : { isActive: true };
    return await Product.find(filter).populate('currentVersionId').exec();
};

exports.getProductById = async (id) => {
    const product = await Product.findOne({ _id: id, isActive: true }).populate('currentVersionId').exec();
    if (!product) throw new Error("Product not found or inactive");
    return product;
};

exports.getProductHistory = async (productId) => {
    return await ProductVersion.find({ productId }).sort({ versionNumber: -1 }).exec();
};

exports.createNewProductVersion = async (productId, changes, files, userId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        if (!product.isActive) throw new Error('Cannot update an inactive product');

        const activeVersions = await ProductVersion.countDocuments({
            productId,
            status: "ACTIVE"
        });

        if (activeVersions !== 1) {
            throw new Error("Invalid state: multiple ACTIVE versions");
        }

        const oldVersion = await ProductVersion.findById(product.currentVersionId);
        if (!oldVersion) throw new Error('Current active version missing');

        const nextSalePrice = changes.salePrice !== undefined ? Number(changes.salePrice) : oldVersion.salePrice;
        const nextCostPrice = changes.costPrice !== undefined ? Number(changes.costPrice) : oldVersion.costPrice;

        if (isNaN(nextSalePrice) || isNaN(nextCostPrice)) {
            throw new Error('salePrice and costPrice must be numbers');
        }

        // Archive isolation
        oldVersion.status = 'ARCHIVED';
        oldVersion.updatedBy = userId;
        await oldVersion.save();

        const image = files?.image?.[0]?.location || oldVersion.image;
        let attachments = [...oldVersion.attachments];

        if (files?.attachments?.length > 0) {
            attachments = files.attachments.map(f => ({
                url: f.location,
                name: f.originalname
            }));
        }

        const nextValidationNumber = oldVersion.versionNumber + 1;

        const newVersion = new ProductVersion({
            productId: product._id,
            versionNumber: nextValidationNumber,
            versionLabel: `v${nextValidationNumber}`,
            salePrice: nextSalePrice,
            costPrice: nextCostPrice,
            image,
            attachments,
            status: 'ACTIVE',
            createdBy: oldVersion.createdBy,
            updatedBy: userId
        });
        await newVersion.save();

        product.currentVersionId = newVersion._id;
        if (changes.name) {
            product.name = changes.name;
        }
        await product.save();

        return newVersion;
    } catch (error) {
        throw error;
    }
};

exports.deleteProduct = async (productId, user) => {
    if (user.role !== 'ADMIN') throw new Error('Not Authorized');
    await ProductVersion.deleteMany({ productId });
    return await Product.findByIdAndDelete(productId);
};
