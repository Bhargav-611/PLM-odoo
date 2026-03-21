const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const operationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time: { type: Number, required: true }, // duration in minutes
    workCenter: { type: String, required: true }
}, { _id: false });

const BoMSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    version: { type: String, required: true }, // e.g., "v1", "v2"
    components: [componentSchema],
    operations: [operationSchema],
    status: {
        type: String,
        enum: ['Draft', 'Under Review', 'Active', 'Archived', 'Rejected'],
        default: 'Draft'
    },
    previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoM', default: null },
    createdBy: { type: String, required: true }, // e.g., role name
}, { timestamps: true });

module.exports = mongoose.model('BoM', BoMSchema);
