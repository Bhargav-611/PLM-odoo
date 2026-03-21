const BoM = require('../models/BoM');

// Helper to calculate diffs
const calculateDiff = (oldBoM, newBoM) => {
    const components = [];
    const operations = [];
    const oldComponents = oldBoM ? oldBoM.components : [];
    const newComponents = newBoM.components;
    
    const oldOps = oldBoM ? oldBoM.operations : [];
    const newOps = newBoM.operations;

    // Components Diff
    const oldMap = new Map(oldComponents.map(c => [c.name, c.quantity]));
    const newMap = new Map(newComponents.map(c => [c.name, c.quantity]));
    const allNames = new Set([...oldMap.keys(), ...newMap.keys()]);

    allNames.forEach(name => {
        const oldQty = oldMap.get(name) || 0;
        const newQty = newMap.get(name) || 0;
        let diffStatus = 'unchanged';
        if (newQty > oldQty && oldQty === 0) diffStatus = 'added';
        else if (newQty > oldQty) diffStatus = 'increased';
        else if (newQty < oldQty && newQty === 0) diffStatus = 'removed';
        else if (newQty < oldQty) diffStatus = 'reduced';

        components.push({ name, oldQty, newQty, status: diffStatus });
    });

    // Operations Diff
    const oldOpMap = new Map(oldOps.map(o => [o.name, o]));
    const newOpMap = new Map(newOps.map(o => [o.name, o]));
    const allOpNames = new Set([...oldOpMap.keys(), ...newOpMap.keys()]);

    allOpNames.forEach(name => {
        const oldOp = oldOpMap.get(name);
        const newOp = newOpMap.get(name);
        let diffStatus = 'unchanged';
        
        if (newOp && !oldOp) diffStatus = 'added';
        else if (!newOp && oldOp) diffStatus = 'removed';
        else if (newOp && oldOp) {
            if (newOp.time !== oldOp.time || newOp.workCenter !== oldOp.workCenter) diffStatus = 'modified';
        }

        operations.push({
            name,
            old: oldOp ? { time: oldOp.time, workCenter: oldOp.workCenter } : null,
            new: newOp ? { time: newOp.time, workCenter: newOp.workCenter } : null,
            status: diffStatus
        });
    });

    return { components, operations };
};

exports.createDraft = async (req, res) => {
    try {
        const { productId, createdBy } = req.body;
        
        // Find existing active BoM to copy from if it exists
        const activeBoM = await BoM.findOne({ productId, status: 'Active' });
        
        // Also check if a draft already exists for this product
        const existingDraft = await BoM.findOne({ productId, status: 'Draft' });
        if (existingDraft) {
            return res.json(existingDraft); // Reuse existing draft
        }

        let version = 'v1';
        let components = [];
        let operations = [];
        let previousVersionId = null;

        if (activeBoM) {
            const lastVersionNum = parseInt(activeBoM.version.replace(/[^0-9]/g, '')) || 1;
            version = `v${lastVersionNum + 1}-draft`;
            components = activeBoM.components;
            operations = activeBoM.operations;
            previousVersionId = activeBoM._id;
        }

        const newDraft = new BoM({
            productId,
            version,
            components,
            operations,
            status: 'Draft',
            previousVersionId,
            createdBy
        });

        await newDraft.save();
        res.status(201).json(newDraft);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBoMsByProduct = async (req, res) => {
    try {
        const boms = await BoM.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(boms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDraft = async (req, res) => {
    try {
        const { components, operations } = req.body;
        const bom = await BoM.findById(req.params.id);
        
        if (!bom || bom.status !== 'Draft') {
            return res.status(400).json({ error: 'Only Draft BoMs can be edited' });
        }

        bom.components = components || bom.components;
        bom.operations = operations || bom.operations;
        await bom.save();
        
        res.json(bom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendForApproval = async (req, res) => {
    try {
        const bom = await BoM.findById(req.params.id);
        if (!bom || bom.status !== 'Draft') {
            return res.status(400).json({ error: 'Only Draft BoMs can be sent for review' });
        }
        bom.status = 'Under Review';
        await bom.save();
        res.json(bom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const pendingBom = await BoM.findById(req.params.id);
        if (!pendingBom || pendingBom.status !== 'Under Review') {
            return res.status(400).json({ error: 'BoM is not under review' });
        }

        // Archive all currently Active BoMs for this product
        await BoM.updateMany(
            { productId: pendingBom.productId, status: 'Active' },
            { status: 'Archived' }
        );

        // Determine new version number:
        // Use previousVersionId if available, otherwise find the highest version among Archived
        let newVersion = 'v1';
        if (pendingBom.previousVersionId) {
            // Most reliable: base version on the BoM we archived
            const prevBom = await BoM.findById(pendingBom.previousVersionId);
            if (prevBom) {
                const lastNum = parseInt(prevBom.version.replace(/[^0-9]/g, '')) || 0;
                newVersion = `v${lastNum + 1}`;
            }
        } else {
            // Fallback: find highest version among all BoMs for this product
            const allBoms = await BoM.find({ productId: pendingBom.productId, status: 'Archived' });
            if (allBoms.length > 0) {
                const maxNum = Math.max(...allBoms.map(b => parseInt(b.version.replace(/[^0-9]/g, '')) || 0));
                newVersion = `v${maxNum + 1}`;
            }
        }

        pendingBom.status = 'Active';
        pendingBom.version = newVersion;
        await pendingBom.save();

        res.json(pendingBom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        const bom = await BoM.findById(req.params.id);
        if (!bom || bom.status !== 'Under Review') {
            return res.status(400).json({ error: 'BoM is not under review' });
        }
        bom.status = 'Draft';
        await bom.save();
        res.json(bom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.compare = async (req, res) => {
    try {
        const currentBom = await BoM.findById(req.params.id);
        if (!currentBom) return res.status(404).json({ error: 'BoM not found' });

        const previousBom = currentBom.previousVersionId 
            ? await BoM.findById(currentBom.previousVersionId)
            : null;

        const diff = calculateDiff(previousBom, currentBom);
        res.json({
            current: currentBom,
            previous: previousBom,
            diff
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
