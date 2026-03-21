// Created by Ghanshyam
const mongoose = require('mongoose');

const ProductVersionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    versionNumber: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    attachments: [{
        url: { type: String },
        name: { type: String }
    }],
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED'],
        required: true,
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('ProductVersion', ProductVersionSchema);
