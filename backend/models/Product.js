const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    currentVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVersion', default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
