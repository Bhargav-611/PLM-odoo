const bomService = require('../services/bomService');

exports.createBOM = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'System Lock: Only Admins can instantiate generic BoM traces.' });
        const result = await bomService.createBOM(req.body, req.user.id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllBOMs = async (req, res) => {
    try {
        const boms = await bomService.getActiveBOMs();
        res.json(boms);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteBOM = async (req, res) => {
    try {
        await bomService.deleteBOM(req.params.id, req.user);
        res.json({ message: 'Bill matrix purged.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
