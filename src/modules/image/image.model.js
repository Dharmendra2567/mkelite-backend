const mongoose = require('mongoose');

const DynamicImageSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: [true, 'Please add a unique tag for the image'],
        unique: true,
        trim: true
    },
    url: {
        type: String,
        required: [true, 'Please add the image URL']
    },
    key: {
        type: String,
        required: [true, 'Please add the S3 key']
    },
    section: {
        type: String,
        enum: ['home', 'about', 'services', 'other'],
        default: 'other'
    },
    alt: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DynamicImage', DynamicImageSchema);
