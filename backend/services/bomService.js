const BOM = require('../models/BOM');
const BOMVersion = require('../models/BOMVersion');
const { logAction } = require('./auditService');

exports.createBOM = async (data, userId) => {
    const existing = await BOM.findOne({ productId: data.productId });
    if (existing) throw new Error("A Bill of Materials already exists for this Product natively.");

    const bom = new BOM({ productId: data.productId, isActive: true });
    await bom.save();

    const components = (data.components || []).map(c => ({
        componentName: c.componentName || (c.productId ? "Legacy Component" : "Unknown"),
        quantity: c.quantity
    }));

    const version = new BOMVersion({
        bomId: bom._id,
        versionNumber: 1,
        components: components,
        operations: data.operations || [],
        status: 'ACTIVE',
        createdBy: userId
    });
    await version.save();

    bom.currentVersionId = version._id;
    await bom.save();

    await logAction('BOM_CREATED', 'BOM', bom._id, null, { versionNumber: 1 }, userId);
    return { bom, version };
};

exports.createNewVersion = async (bomId, changes, comment, userId) => {
    const bom = await BOM.findById(bomId);
    if (!bom) throw new Error('BOM not found');

    const activeVersion = await BOMVersion.findById(bom.currentVersionId);
    if (!activeVersion) throw new Error('No active Version pointer resolved securely.');

    activeVersion.status = 'ARCHIVED';
    activeVersion.updatedBy = userId;
    await activeVersion.save();

    const nextVersionNumber = activeVersion.versionNumber + 1;

    const components = (changes.components || activeVersion.components).map(c => ({
        componentName: c.componentName || "Legacy Component",
        quantity: c.quantity
    }));

    const newVersion = new BOMVersion({
        bomId: bom._id,
        versionNumber: nextVersionNumber,
        components: components,
        operations: changes.operations || activeVersion.operations,
        status: 'ACTIVE',
        createdBy: userId
    });
    await newVersion.save();

    bom.currentVersionId = newVersion._id;
    await bom.save();

    await logAction('BOM_NEW_VERSION', 'BOM', bom._id, { prevVersionId: activeVersion._id }, { newVersionId: newVersion._id, comment }, userId);

    return newVersion;
};

exports.getActiveBOMs = async () => {
    return await BOM.find({ isActive: true })
        .populate('productId', 'name')
        .populate({
            path: 'currentVersionId'
        })
        .sort({ createdAt: -1 });
};

exports.deleteBOM = async (bomId, user) => {
    if (user.role !== 'ADMIN') throw new Error('Not Authorized');
    await BOMVersion.deleteMany({ bomId });
    return await BOM.findByIdAndDelete(bomId);
};
