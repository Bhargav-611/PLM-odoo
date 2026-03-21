const ECO = require('../models/ECO');
const Product = require('../models/Product');
const ProductVersion = require('../models/ProductVersion');
const BOM = require('../models/BOM');
const BOMVersion = require('../models/BOMVersion');
const { logAction } = require('./auditService');
const { compareObjects } = require('../utils/compareObjects');
const productService = require('./productService');
const bomService = require('./bomService');

exports.checkRole = (userRole, allowedRoles) => {
    if (userRole === 'ADMIN') return true;
    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
    }
    return true;
};

exports.getNextStage = (currentStage) => {
    const stages = ['NEW_REQUEST', 'REQUEST_APPROVED', 'IN_CHANGE', 'FINAL_APPROVAL', 'DONE', 'APPLIED'];
    const idx = stages.indexOf(currentStage);
    if (idx !== -1 && idx < stages.length - 1) return stages[idx + 1];
    return currentStage;
};

exports.createECO = async (data, user) => {
    this.checkRole(user.role, ['ENGINEER']);

    const eco = new ECO({
        title: data.title,
        changeDescription: data.changeDescription,
        ecoType: data.ecoType || 'PRODUCT',
        productId: data.productId,
        requestedBy: user.id,
        stage: 'NEW_REQUEST'
    });
    await eco.save();
    await logAction('ECO_CREATED', 'ECO', eco._id, null, { title: data.title, stage: 'NEW_REQUEST' }, user.id);
    return eco;
};

exports.approveRequest = async (ecoId, user) => {
    this.checkRole(user.role, ['APPROVER']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'NEW_REQUEST') throw new Error('Invalid stage for approval request');

    eco.stage = this.getNextStage(eco.stage);
    eco.approvedBy = user.id;
    await eco.save();
    await logAction('ECO_REQUEST_APPROVED', 'ECO', eco._id, { stage: 'NEW_REQUEST' }, { stage: eco.stage }, user.id);
    return eco;
};

exports.editECO = async (ecoId, changesDraft, user) => {
    this.checkRole(user.role, ['ENGINEER']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'REQUEST_APPROVED' && eco.stage !== 'IN_CHANGE') throw new Error('ECO not in editable stage');

    eco.stage = 'IN_CHANGE';
    eco.changesDraft = { ...eco.changesDraft, ...changesDraft };
    await eco.save();
    await logAction('ECO_DRAFT_EDITED', 'ECO', eco._id, null, changesDraft, user.id);
    return eco;
};

exports.sendFinalApproval = async (ecoId, user) => {
    this.checkRole(user.role, ['ENGINEER']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'IN_CHANGE') throw new Error('Must be IN_CHANGE to send for final approval');

    const oldStage = eco.stage;
    eco.stage = this.getNextStage(eco.stage);
    eco.changesFinal = { ...eco.changesDraft };
    await eco.save();

    await logAction('ECO_SENT_FINAL_APPROVAL', 'ECO', eco._id, { stage: oldStage }, { stage: eco.stage }, user.id);
    return eco;
};

exports.compareECOData = async (ecoId, user) => {
    this.checkRole(user.role, ['APPROVER', 'ENGINEER', 'OPERATOR']); // Everyone can view

    const eco = await ECO.findById(ecoId).populate('productId');
    if (!eco) throw new Error('ECO not found');

    if (eco.ecoType === 'BOM') {
        const product = eco.productId;
        const bom = await BOM.findOne({ productId: product._id });
        if (!bom) throw new Error('Master BoM node not configured for this Product trace natively.');

        const currentActiveVersion = await BOMVersion.findById(bom.currentVersionId).lean();
        const newDraft = { ...currentActiveVersion, ...eco.changesFinal, ...eco.changesDraft };
        const diff = compareObjects(currentActiveVersion, newDraft);
        const result = {
            description: eco.changeDescription,
            oldProduct: currentActiveVersion,
            newDraft,
            diff
        };
        eco.compareData = result;
        await eco.save();
        return result;
    } else {
        const product = eco.productId;
        const currentActiveVersion = await ProductVersion.findById(product.currentVersionId).lean();

        const newDraft = { ...currentActiveVersion, ...eco.changesFinal, ...eco.changesDraft };
        const diff = compareObjects(currentActiveVersion, newDraft);
        const result = {
            description: eco.changeDescription,
            oldProduct: currentActiveVersion,
            newDraft,
            diff
        };
        eco.compareData = result;
        await eco.save();
        return result;
    }
};

exports.finalApprove = async (ecoId, user) => {
    this.checkRole(user.role, ['APPROVER']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'FINAL_APPROVAL') throw new Error('Must be in FINAL_APPROVAL stage');

    const oldStage = eco.stage;
    eco.stage = this.getNextStage(eco.stage);
    await eco.save();
    await logAction('ECO_FINAL_APPROVED', 'ECO', eco._id, { stage: oldStage }, { stage: eco.stage }, user.id);
    return eco;
};

exports.applyECO = async (ecoId, user) => {
    this.checkRole(user.role, ['ADMIN', 'APPROVER', 'ENGINEER']); // System apply typically triggers by anyone, restrict to appropriate

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.stage !== 'DONE') throw new Error('ECO must be DONE to apply');

    if (eco.ecoType === 'BOM') {
        const bom = await BOM.findOne({ productId: eco.productId });
        if (!bom) throw new Error('No Master BoM tracking mapped explicitly inside node integrations.');
        const newVersion = await bomService.createNewVersion(bom._id, eco.changesFinal, null, user.id);
        await logAction('ECO_APPLIED', 'BOM', newVersion._id, null, { appliedECO: eco._id }, user.id);
    } else {
        const newVersion = await productService.createNewProductVersion(eco.productId, eco.changesFinal, null, user.id);
        await logAction('ECO_APPLIED', 'Product', newVersion._id, null, { appliedECO: eco._id }, user.id);
    }

    const oldStage = eco.stage;
    eco.stage = 'APPLIED';
    eco.applied = true;
    await eco.save();

    return eco;
};

exports.getAllECO = async () => {
    return await ECO.find().populate('requestedBy approvedBy productId').sort({ createdAt: -1 });
};
