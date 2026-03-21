const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const ProductVersionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    versionNumber: { type: Number, required: true },
    versionLabel: { type: String, required: true }, // e.g v1, v2
    salePrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    image: { type: String }, // S3 URL
    attachments: [AttachmentSchema],
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED'],
        default: 'ACTIVE'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ProductVersionSchema.index({ productId: 1, versionNumber: 1 });
ProductVersionSchema.index({ productId: 1, status: 1 }); // Optimized for active version fetches

module.exports = mongoose.model('ProductVersion', ProductVersionSchema);
