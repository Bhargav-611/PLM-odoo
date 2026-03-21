const ecoService = require('../services/ecoService');

exports.createECO = async (req, res) => {
    try {
        const eco = await ecoService.createECO(req.body, req.user);
        res.status(201).json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const eco = await ecoService.approveRequest(req.params.id, req.user);
        res.json(eco);
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

exports.sendFinalApproval = async (req, res) => {
    try {
        const eco = await ecoService.sendFinalApproval(req.params.id, req.user);
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

exports.finalApprove = async (req, res) => {
    try {
        const eco = await ecoService.finalApprove(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.applyECO = async (req, res) => {
    try {
        const eco = await ecoService.applyECO(req.params.id, req.user);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllECO = async (req, res) => {
    try {
        const ecos = await ecoService.getAllECO();
        res.json(ecos);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
