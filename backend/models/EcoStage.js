const mongoose = require('mongoose');

const ECOStageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, required: true },
    description: { type: String },
    isFinal: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ECOStage', ECOStageSchema);
