const ecoService = require('../services/ecoService');

exports.createECO = async (req, res) => {
    try {
        const eco = await ecoService.createECO(req.body, req.user.id);
        res.status(201).json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateChanges = async (req, res) => {
    try {
        const eco = await ecoService.updateECOChanges(req.params.id, req.body);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.startReview = async (req, res) => {
    try {
        const eco = await ecoService.startReview(req.params.id);
        res.json(eco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.approveECO = async (req, res) => {
    try {
        const result = await ecoService.approveECO(req.params.id, req.user.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
