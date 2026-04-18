const mongoose = require('mongoose');

const JobseekerSchema = new mongoose.Schema({

    // 🔹 User Link (AUTH SYSTEM)
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // 🔹 Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },

    avatar: {
        type: String,
        default: 'default-avatar.png'
    },

    headline: String, // e.g., "Frontend Developer | React Specialist"

    bio: String,

    phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid phone number']
    },

    location: {
        city: String,
        state: String,
        country: String
    },

    // 🔹 Skills & Languages
    skills: {
        type: [String]
    },
    languages: {
        type: [String],
        default: []
    },

    // 🔹 Experience
    experience: [{
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
        currentlyWorking: Boolean,
        description: String,
        workMode: {
            type: String,
            enum: ['Remote', 'Onsite', 'Hybrid'],
            default: 'Onsite'
        },
        location: String
    }],

    // 🔹 Education
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number
    }],

    // 🔹 Resume (Improved)
    resumes: [{
        url: String,
        fileName: String,
        isDefault: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // 🔹 Social Links
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    },

    // 🔹 Job Preferences ⭐
    preferences: {
        jobTypes: [String], // Full-time, Part-time, etc.
        workModes: [String], // Remote, Hybrid, On-site
        preferredLocations: [String],
        expectedSalary: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'INR'
            }
        }
    },

    // 🔹 Saved Jobs ⭐
    savedJobs: [{
        job: {
            type: mongoose.Schema.ObjectId,
            ref: 'Job'
        },
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // 🔹 Applied Jobs (Reference Only) ⭐
    applications: [{
        application: {
            type: mongoose.Schema.ObjectId,
            ref: 'Application'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // 🔹 Activity Tracking
    isActivelyLooking: {
        type: Boolean,
        default: true
    },

    profileVisibility: {
        type: String,
        enum: ['Public', 'Private', 'Recruiters Only'],
        default: 'Public'
    },

    lastActiveAt: Date,

    profileCompletion: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});


// 🔍 Indexing for performance
JobseekerSchema.index({ skills: 1 });
JobseekerSchema.index({ "location.city": 1 });
JobseekerSchema.index({ "preferences.jobTypes": 1 });

module.exports = mongoose.model('JobseekerProfile', JobseekerSchema);