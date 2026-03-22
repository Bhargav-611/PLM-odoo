const mongoose = require('mongoose');

const BOMSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    currentVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BOMVersion' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BOM', BOMSchema);
