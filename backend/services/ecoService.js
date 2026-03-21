const ECO = require('../models/ECO');
const Product = require('../models/Product');
const diffUtil = require('../utils/diffUtil');

exports.createECO = async (ecoData, userId) => {
    const eco = new ECO({
        ...ecoData,
        createdBy: userId,
        stage: 'DRAFT'
    });
    return await eco.save();
};

exports.updateECOChanges = async (ecoId, newData) => {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'DRAFT') throw new Error('Can only update changes in DRAFT stage');

    const product = await Product.findById(eco.productId);
    if (!product) throw new Error('Product not found');

    const changes = diffUtil.getChanges(product.toObject(), newData);
    eco.changes = { ...eco.changes, ...changes };
    return await eco.save();
};

exports.startReview = async (ecoId) => {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    eco.stage = 'IN_REVIEW';
    return await eco.save();
};

exports.approveECO = async (ecoId, approverId) => {
    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'IN_REVIEW') throw new Error('ECO must be IN_REVIEW to be approved');

    eco.stage = 'APPROVED';
    eco.approvedBy = approverId;
    await eco.save();

    // Archiving old version and creating new version
    const oldProduct = await Product.findById(eco.productId);
    oldProduct.status = 'ARCHIVED';
    await oldProduct.save();

    const newProductData = {
        ...oldProduct.toObject(),
        ...eco.changes,
        _id: undefined,
        version: oldProduct.version + 1,
        status: 'ACTIVE',
        originalProductId: oldProduct._id
    };

    // Remove the mongodb managed properties explicitly before save if any issues
    delete newProductData._id;
    delete newProductData.createdAt;
    delete newProductData.updatedAt;

    const newProduct = new Product(newProductData);
    await newProduct.save();

    return { eco, newProduct };
};
