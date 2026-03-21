const mongoose = require('mongoose');

const BOMVersionSchema = new mongoose.Schema({
    bomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM', required: true },
    versionNumber: { type: Number, required: true },
    components: [{
        componentName: { type: String, required: true },
        quantity: { type: Number, required: true }
    }],
    operations: [{
        workCenter: { type: String, required: true },
        time: { type: Number, required: true } // in minutes
    }],
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BOMVersion', BOMVersionSchema);
