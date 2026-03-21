const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
