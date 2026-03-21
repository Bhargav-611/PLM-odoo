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

exports.createECO = async (data, user) => {
    this.checkRole(user.role, ['ENGINEER']);

    const targetProduct = await Product.findById(data.productId);
    if (!targetProduct) throw new Error("Target product not found");
    if (!targetProduct.isActive && user.role !== 'ADMIN') {
        throw new Error("Cannot propose changes against an archived Product natively. Contact Administrator.");
    }

    if (data.bomId) {
        const targetBOM = await BOM.findById(data.bomId);
        if (targetBOM && !targetBOM.isActive && user.role !== 'ADMIN') {
            throw new Error("Cannot propose changes against an archived BoM natively. Contact Administrator.");
        }
    }

    const eco = new ECO({
        title: data.title,
        changeDescription: data.changeDescription,
        ecoType: data.ecoType || 'PRODUCT',
        productId: data.productId,
        bomId: data.bomId,
        createdBy: user.id,
        status: 'NEW',
        isLocked: false,
        effectiveDate: data.effectiveDate,
        versionUpdate: data.versionUpdate || false
    });
    await eco.save();
    await logAction('ECO_CREATED', 'ECO', eco._id, null, { title: data.title, status: 'NEW' }, user.id);
    return eco;
};

exports.editECO = async (ecoId, changesDraft, user) => {
    this.checkRole(user.role, ['ENGINEER', 'ADMIN']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');

    if (eco.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
        throw new Error('Access denied: You can only edit ECOs you created.');
    }

    if (eco.isLocked) throw new Error('ECO is locked and cannot be edited. It has already been submitted.');
    if (eco.status !== 'NEW') throw new Error('ECO not in editable status');

    eco.changesDraft = { ...eco.changesDraft, ...changesDraft };
    await eco.save();
    await logAction('ECO_DRAFT_EDITED', 'ECO', eco._id, null, changesDraft, user.id);
    return eco;
};

exports.submitECOForApproval = async (ecoId, user) => {
    this.checkRole(user.role, ['ENGINEER']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.isLocked) throw new Error('ECO is already submitted');
    if (eco.createdBy.toString() !== user.id) throw new Error('Only the creator can submit this ECO');

    eco.isLocked = true;
    eco.submittedAt = new Date();
    eco.changesFinal = { ...eco.changesDraft }; // Freeze the changes

    if (eco.approvers && eco.approvers.length > 0) {
        eco.status = 'IN_PROGRESS';
    }

    await eco.save();
    await logAction('ECO_SUBMITTED', 'ECO', eco._id, { isLocked: false }, { isLocked: true, status: eco.status }, user.id);
    return eco;
};

exports.assignApprovers = async (ecoId, approverIds, user) => {
    this.checkRole(user.role, ['ADMIN']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.status === 'APPROVED' || eco.status === 'REJECTED') {
        throw new Error(`Cannot assign approvers to an ECO that is ${eco.status}`);
    }

    if (!approverIds || approverIds.length === 0) {
        throw new Error('Approvers list cannot be empty');
    }

    const newApprovers = approverIds.map((id, index) => ({
        user: id,
        order: index + 1,
        status: 'PENDING'
    }));

    eco.approvers = newApprovers;
    eco.currentApproverIndex = 0;
    eco.isReadyForFinalApproval = false;

    if (eco.isLocked) {
        eco.status = 'IN_PROGRESS';
    }

    await eco.save();
    await logAction('ECO_APPROVERS_ASSIGNED', 'ECO', eco._id, null, { approverCount: newApprovers.length }, user.id);
    return eco;
};

exports.approveECO = async (ecoId, user) => {
    this.checkRole(user.role, ['APPROVER', 'ADMIN']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.status !== 'IN_PROGRESS') throw new Error('ECO is not currently in progress');
    if (eco.isReadyForFinalApproval) throw new Error('ECO is awaiting final admin approval');

    const currentIndex = eco.currentApproverIndex;
    if (currentIndex >= eco.approvers.length) throw new Error('No more approvers in the chain');

    const currentApprover = eco.approvers[currentIndex];
    if (currentApprover.user.toString() !== user.id && user.role !== 'ADMIN') {
        throw new Error('It is not your turn to approve this ECO');
    }

    currentApprover.status = 'APPROVED';
    currentApprover.approvedAt = new Date();

    eco.currentApproverIndex += 1;

    if (eco.currentApproverIndex >= eco.approvers.length) {
        eco.isReadyForFinalApproval = true;
    }

    await eco.save();
    await logAction('ECO_STEP_APPROVED', 'ECO', eco._id, { step: currentIndex + 1 }, { step: currentIndex + 1, approvedBy: user.id }, user.id);
    return eco;
};

exports.rejectECO = async (ecoId, reason, user) => {
    // Anyone involved (Engineer, Approver, Admin) could technically reject, but strictly Approvers and Admins make sense
    this.checkRole(user.role, ['APPROVER', 'ADMIN']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.status === 'APPROVED' || eco.status === 'REJECTED') {
        throw new Error(`ECO is already ${eco.status}`);
    }

    // Verify user is in approvers list or is Admin
    const isAssignedApprover = eco.approvers.some(a => a.user.toString() === user.id);
    if (!isAssignedApprover && user.role !== 'ADMIN') {
        throw new Error('You are not authorized to reject this ECO');
    }

    eco.status = 'REJECTED';
    eco.rejectedBy = user.id;
    eco.rejectionReason = reason || 'No reason provided';

    // If they were rejecting on their turn, mark their specific step
    if (eco.currentApproverIndex < eco.approvers.length) {
        const currentA = eco.approvers[eco.currentApproverIndex];
        if (currentA.user.toString() === user.id) {
            currentA.status = 'REJECTED';
            currentA.rejectedAt = new Date();
        }
    }

    await eco.save();
    await logAction('ECO_REJECTED', 'ECO', eco._id, null, { reason, rejectedBy: user.id }, user.id);
    return eco;
};

exports.applyECOChanges = async (ecoId, user) => {
    this.checkRole(user.role, ['ADMIN']);

    const eco = await ECO.findById(ecoId);
    if (!eco) throw new Error('ECO not found');
    if (eco.status !== 'IN_PROGRESS') throw new Error('ECO is not IN_PROGRESS');
    if (!eco.isReadyForFinalApproval) throw new Error('All sequential approvers must approve before final apply');

    if (eco.versionUpdate) {
        if (eco.ecoType === 'BOM') {
            const bom = await BOM.findOne({ productId: eco.productId });
            if (!bom) throw new Error('No Master BoM tracking mapped explicitly inside node integrations.');
            const newVersion = await bomService.createNewVersion(bom._id, eco.changesFinal, null, user.id);
            await logAction('ECO_APPLIED', 'BOM', newVersion._id, null, { appliedECO: eco._id }, user.id);
        } else {
            const newVersion = await productService.createNewProductVersion(eco.productId, eco.changesFinal, null, user.id);
            await logAction('ECO_APPLIED', 'Product', newVersion._id, null, { appliedECO: eco._id }, user.id);
        }
    } else {
        await logAction('ECO_ARCHIVED_WITHOUT_VERSION', 'ECO', eco._id, null, { message: 'Workflow completed without master version update.' }, user.id);
    }

    eco.status = 'APPROVED';
    eco.finalApprovedBy = user.id;
    eco.applied = true;
    if (!eco.effectiveDate) eco.effectiveDate = new Date();

    await eco.save();
    return eco;
};

exports.compareECOData = async (ecoId, user) => {
    this.checkRole(user.role, ['APPROVER', 'ENGINEER', 'OPERATOR', 'ADMIN']);

    const eco = await ECO.findById(ecoId).populate('productId createdBy approvers.user finalApprovedBy rejectedBy');
    if (!eco) throw new Error('ECO not found');

    if (eco.ecoType === 'BOM') {
        const product = eco.productId;
        const bom = await BOM.findOne({ productId: product._id });
        if (!bom) throw new Error('Master BoM node not configured for this Product trace natively.');

        const currentActiveVersion = await BOMVersion.findById(bom.currentVersionId).lean();
        const draftOrFinal = eco.isLocked ? eco.changesFinal : eco.changesDraft;
        const newDraft = { ...currentActiveVersion, ...draftOrFinal };
        const diff = compareObjects(currentActiveVersion, newDraft);
        const result = {
            description: eco.changeDescription,
            oldProduct: currentActiveVersion,
            newDraft,
            diff
        };
        eco.compareData = result;
        await eco.save();
        return { ...result, eco };
    } else {
        const product = eco.productId;
        const currentActiveVersion = await ProductVersion.findById(product.currentVersionId).lean();

        const draftOrFinal = eco.isLocked ? eco.changesFinal : eco.changesDraft;
        const newDraft = { ...currentActiveVersion, ...draftOrFinal };
        const diff = compareObjects(currentActiveVersion, newDraft);
        const result = {
            description: eco.changeDescription,
            oldProduct: currentActiveVersion,
            newDraft,
            diff
        };
        eco.compareData = result;
        await eco.save();
        return { ...result, eco };
    }
};

exports.getAllECO = async (user) => {
    let query = {};
    if (user.role === 'ENGINEER') {
        query = { createdBy: user.id };
    } else if (user.role === 'APPROVER') {
        query = { 'approvers.user': user.id };
    } // ADMIN gets all

    return await ECO.find(query)
        .populate('createdBy approvers.user finalApprovedBy rejectedBy productId bomId')
        .sort({ createdAt: -1 });
};
