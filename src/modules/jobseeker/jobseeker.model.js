const mongoose = require('mongoose');

const JobseekerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true // 1-to-1 relationship guarantee
    },
    name: {
        type: String,
        required: [true, 'Please add your full name'],
        trim: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    specialization: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid phone number']
    },
    skills: {
        type: [String],
        index: true // Allow for fast array searching
    },
    experience: [{
        company: { type: String, required: true },
        role: { type: String, required: true },
        period: { type: String, required: true }, // e.g., '2020 - 2022' or 'Jan 2020 - Present'
        description: { type: String }
    }],
    education: [{
        school: { type: String, required: true },
        degree: { type: String, required: true },
        year: { type: String, required: true }
    }],
    resumeUrl: {
        type: String
    },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    },
    preferredSalary: {
        type: String
    },
    isActivelyLooking: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index optimization for massive reads
JobseekerSchema.index({ specialization: 1, location: 1 });

module.exports = mongoose.model('JobseekerProfile', JobseekerSchema);
