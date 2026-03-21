const mongoose = require('mongoose');

const EmployerSchema = new mongoose.Schema({
    // 🔹 लिंक to User (1:1)
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    // 🔹 Basic Company Info
    companyName: {
        type: String,
        required: [true, 'Please add your company name'],
        trim: true,
        unique: true
    },

    logo: {
        type: String,
        default: 'default-company-logo.png'
    },

    coverImage: String,

    description: {
        type: String,
        required: [true, 'Please add a company description']
    },

    website: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v || v.trim() === '') return true; // optional — skip if empty
                return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(v);
            },
            message: 'Please use a valid URL with HTTP or HTTPS (e.g. https://example.com)'
        }
    },

    // 🔹 Industry & Company Size
    industry: {
        type: String,
        required: [true, 'Please add an industry']
    },

    foundedYear: Number,

    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },

    // 🔹 Structured Location (Improved)
    location: {
        city: {
            type: String,
            required: true
        },
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        fullAddress: String,
        pincode: String
    },

    // 🔹 Contact Info
    contactInfo: {
        email: String,
        phone: String,
        alternatePhone: String
    },

    // 🔹 HR / Recruiter Details
    hrDetails: {
        name: String,
        email: String,
        phone: String,
        designation: String
    },

    // 🔹 Social Links
    socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String
    },

    // 🔹 Branding / Media
    gallery: [String], // office photos

    // 🔹 Benefits & Culture
    benefits: [String],

    tags: [String], // e.g. Startup, Remote-friendly

    // 🔹 Verification & Trust
    isVerified: {
        type: Boolean,
        default: false
    },

    verificationDocuments: [String], // GST, CIN etc.

    // 🔹 Legal Info (India-focused)
    legalInfo: {
        gstNumber: String,
        cinNumber: String
    },

    // 🔹 Hiring Stats
    hiringInfo: {
        totalJobsPosted: {
            type: Number,
            default: 0
        },
        activeJobs: {
            type: Number,
            default: 0
        }
    },

    // 🔹 Ratings (Future-ready)
    rating: {
        type: Number,
        default: 0
    },

    reviewsCount: {
        type: Number,
        default: 0
    },

    // 🔹 Status Control (Admin Use)
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Blocked'],
        default: 'Active'
    }

}, {
    timestamps: true
});


// 🔍 Indexing for faster queries
EmployerSchema.index({
    companyName: 1,
    industry: 1,
    "location.city": 1
});

module.exports = mongoose.model('EmployerProfile', EmployerSchema);