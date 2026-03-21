const mongoose = require('mongoose');

const ECOSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    changes: { type: Object, required: true }, // Stores only changed fields
    stage: {
        type: String,
        enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'DRAFT'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ECO', ECOSchema);
