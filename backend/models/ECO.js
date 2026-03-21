const mongoose = require('mongoose');

const ECOSchema = new mongoose.Schema({
    title: { type: String, required: true },
    changeDescription: { type: String },
    ecoType: { type: String, enum: ['PRODUCT', 'BOM'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    bomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM' },

    // Workflow Status
    status: {
        type: String,
        enum: ['NEW', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
        default: 'NEW'
    },

    // Creation & submission locking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date },
    isLocked: { type: Boolean, default: false }, // True after submission

    // Sequential Approval Chain
    approvers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        order: { type: Number, required: true }, // 1, 2, 3...
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        approvedAt: { type: Date },
        rejectedAt: { type: Date }
    }],
    currentApproverIndex: { type: Number, default: 0 },

    // Final stages & Rejection
    isReadyForFinalApproval: { type: Boolean, default: false },
    finalApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },

    // Core payload operations
    effectiveDate: { type: Date },
    versionUpdate: { type: Boolean, default: false },
    changesDraft: { type: mongoose.Schema.Types.Mixed, default: {} },
    changesFinal: { type: mongoose.Schema.Types.Mixed, default: {} },
    compareData: { type: mongoose.Schema.Types.Mixed }, // Cached diff block

    // Application state
    applied: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ECO', ECOSchema);
