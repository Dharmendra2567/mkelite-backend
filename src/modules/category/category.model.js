const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true
    },
    level: {
        type: String,
        enum: ['industry', 'department', 'role'],
        required: [true, 'Please specify the category level (industry, department, role)']
    },
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    icon: {
        type: String // Optional, mostly used for 'industry' level
    },
    count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Enforce unique names within the same parent branch
CategorySchema.index({ name: 1, parentId: 1 }, { unique: true });
CategorySchema.index({ level: 1 });

module.exports = mongoose.model('Category', CategorySchema);
