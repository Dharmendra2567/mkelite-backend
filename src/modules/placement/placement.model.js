const mongoose = require('mongoose');

const PlacementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a candidate name'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Please add the placed role']
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    placedCompany: {
        type: String,
        required: [true, 'Please add the placed company']
    }
}, {
    timestamps: true
});

PlacementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Placement', PlacementSchema);
