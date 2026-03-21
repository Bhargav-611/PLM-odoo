// Created by Ghanshyam
const Product = require('../models/Product');
const ProductVersion = require('../models/ProductVersion');

class ProductService {
    /**
     * Create Product
     * - Create Product
     * - Create initial ProductVersion (versionNumber = 1)
     * - Set status ACTIVE
     * - Update Product.currentVersionId
     */
    async createProduct(data) {
        const { name, salePrice, costPrice, attachments } = data;

        // 1. Create base product
        const product = new Product({
            name,
            isActive: true
        });

        // 2. Create version 1
        const version = new ProductVersion({
            productId: product._id,
            versionNumber: 1,
            salePrice,
            costPrice,
            attachments: attachments || [],
            status: 'ACTIVE'
        });

        // 3. Save version
        const savedVersion = await version.save();

        // 4. Update product currentVersionId and save
        product.currentVersionId = savedVersion._id;
        await product.save();

        return { product, version: savedVersion };
    }

    /**
     * Return products with current version details (populate)
     */
    async getAllProducts() {
        return await Product.find({ isActive: true }).populate('currentVersionId');
    }

    /**
     * Return product + current version
     */
    async getProductById(id) {
        const product = await Product.findById(id).populate('currentVersionId');
        if (!product) throw new Error('Product not found');
        return product;
    }

    /**
     * Return all versions sorted by versionNumber DESC
     */
    async getProductHistory(productId) {
        // Validate product exists first
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');

        return await ProductVersion.find({ productId }).sort({ versionNumber: -1 });
    }

    /**
     * createNewProductVersion(productId, changes)
     * MOST IMPORTANT function.
     * 1. Find product
     * 2. Get current ACTIVE version
     * 3. Archive old version (status = ARCHIVED)
     * 4. Create new version: versionNumber = old + 1, applying changes.
     * 5. Set new version as ACTIVE
     * 6. Update Product.currentVersionId
     */
    async createNewProductVersion(productId, changes) {
        // 1. Find Product
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // 2. Find Current ACTIVE Version
        const activeVersion = await ProductVersion.findById(product.currentVersionId);
        if (!activeVersion) {
            throw new Error('Active product version not found');
        }

        // 3. Archive old version
        activeVersion.status = 'ARCHIVED';
        await activeVersion.save();

        // 4. Create new version
        const newVersionNumber = activeVersion.versionNumber + 1;
        
        // Ensure changes logic matches requirements (keep old value if not provided)
        const newSalePrice = changes.salePrice !== undefined ? changes.salePrice : activeVersion.salePrice;
        const newCostPrice = changes.costPrice !== undefined ? changes.costPrice : activeVersion.costPrice;
        const newAttachments = changes.attachments !== undefined ? changes.attachments : activeVersion.attachments;

        // Optionally handle name change on the master record (though rules only mention ProductVersion updates)
        if (changes.name) {
            product.name = changes.name;
        }

        const newVersion = new ProductVersion({
            productId: product._id,
            versionNumber: newVersionNumber,
            salePrice: newSalePrice,
            costPrice: newCostPrice,
            attachments: newAttachments,
            status: 'ACTIVE' // 5. Set as ACTIVE
        });

        const savedNewVersion = await newVersion.save();

        // 6. Update product
        product.currentVersionId = savedNewVersion._id;
        await product.save();

        return savedNewVersion;
    }
}

module.exports = new ProductService();
