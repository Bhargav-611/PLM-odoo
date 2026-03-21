const mongoose = require('mongoose');

const ECOSchema = new mongoose.Schema({
    title: { type: String, required: true },
    changeDescription: { type: String }, // Required via user prompt
    ecoType: { type: String, enum: ['PRODUCT', 'BOM'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    bomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM' }, // Optional future scaling
    stage: {
        type: String,
        enum: ['NEW_REQUEST', 'REQUEST_APPROVED', 'IN_CHANGE', 'FINAL_APPROVAL', 'DONE', 'APPLIED'],
        default: 'NEW_REQUEST'
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    effectiveDate: { type: Date },
    versionUpdate: { type: Boolean, default: false },
    changesDraft: { type: mongoose.Schema.Types.Mixed, default: {} }, // Temporary sandbox edits
    changesFinal: { type: mongoose.Schema.Types.Mixed, default: {} }, // Sealed for approval
    compareData: { type: mongoose.Schema.Types.Mixed }, // Cached diff block
    applied: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ECO', ECOSchema);
