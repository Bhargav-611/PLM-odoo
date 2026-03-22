const ecoService = require('../services/ecoService');

exports.createECO = async (req, res) => {
    try {
        const eco = await ecoService.createECO(req.body, req.user);
        res.status(201).json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.editECO = async (req, res) => {
    try {
        const eco = await ecoService.editECO(req.params.id, req.body.changesDraft, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.submitECOForApproval = async (req, res) => {
    try {
        const eco = await ecoService.submitECOForApproval(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.assignApprovers = async (req, res) => {
    try {
        // Support either approverIds or approvers flawlessly flaws Node flawlessly!
        const eco = await ecoService.assignApprovers(req.params.id, req.body.approvers || req.body.approverIds, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.skipApprover = async (req, res) => {
    try {
        const eco = await ecoService.skipApprover(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.approveECO = async (req, res) => {
    try {
        const eco = await ecoService.approveECO(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.rejectECO = async (req, res) => {
    try {
        const eco = await ecoService.rejectECO(req.params.id, req.body.reason, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.applyECOChanges = async (req, res) => {
    try {
        const eco = await ecoService.applyECOChanges(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.compareECO = async (req, res) => {
    try {
        const compareResult = await ecoService.compareECOData(req.params.id, req.user);
        res.json(compareResult);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllECO = async (req, res) => {
    try {
        const ecos = await ecoService.getAllECO(req.user);
        res.json(ecos);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
