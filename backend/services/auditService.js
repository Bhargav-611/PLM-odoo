const Audit = require('../models/Audit');

exports.logAction = async (action, entity, entityId, oldValue, newValue, userId) => {
    try {
        const log = new Audit({
            action,
            entity,
            entityId,
            oldValue,
            newValue,
            user: userId
        });
        await log.save();
        return log;
    } catch (err) {
        console.error('Audit Logging Failed:', err);
        // Do not throw so we don't break main business logic loops unless strictly necessary
    }
};

exports.getAuditLogs = async () => {
    return await Audit.find().populate('user', 'name role email').sort({ timestamp: -1 });
};
