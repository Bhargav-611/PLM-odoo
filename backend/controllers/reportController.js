const ecoService = require('../services/ecoService');
const auditService = require('../services/auditService');

exports.getEcoReport = async (req, res) => {
    try {
        const ecos = await ecoService.getAllECO();
        res.json(ecos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await auditService.getAuditLogs();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
