const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
    action: { type: String, required: true },
    entity: { type: String, required: true }, // e.g. 'ECO', 'Product'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed }, // Snapshot of prior state
    newValue: { type: mongoose.Schema.Types.Mixed }, // Snapshot of new state
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audit', AuditSchema);
