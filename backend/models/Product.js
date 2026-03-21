const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    salePrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    version: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
        default: 'ACTIVE'
    },
    originalProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
