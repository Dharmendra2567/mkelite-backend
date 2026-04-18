const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        unique: true,
        required: [true, 'Job ID is required']
    },

    // 🔹 Basic Info (Header)
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },

    // 🔹 Company Reference (links to EmployerProfile)
    employerProfileId: {
        type: mongoose.Schema.ObjectId,
        ref: 'EmployerProfile'
    },

    location: {
        city: String,
        state: String,
        country: String,
        fullAddress: String
    },

    type: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Volunteer']
    },

    workMode: {
        type: String,
        enum: ['On-site', 'Remote', 'Hybrid']
    },

    // 🔹 Salary
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        period: {
            type: String,
            enum: ['Hourly', 'Monthly', 'Yearly'],
            default: 'Monthly'
        },
        isNegotiable: {
            type: Boolean,
            default: false
        }
    },

    // 🔹 Overview
    overview: {
        type: String,
        maxlength: 300
    },

    // 🔹 Detailed Sections
    description: {
        type: String,
        required: true
    },

    responsibilities: [String],

    requirements: [String], // required skills

    preferredQualifications: [String],

    benefits: [String],

    // 🔹 Experience & Education
    experience: {
        min: Number,
        max: Number,
        unit: {
            type: String,
            default: 'years'
        }
    },

    education: String,

    // 🔹 Work Details
    workDetails: {
        shift: String,
        workingDays: String,
        hoursPerWeek: Number
    },

    // 🔹 Tags & Categories
    tags: [String],
    category: {
        type: String,
        required: true
    },

    subCategory: {
        type: String,
        required: true
    },

    subSubCategory: {
        type: String,
        required: true
    },

    // 🔹 Company Info
    companyInfo: {
        about: String,
        website: String,
        size: String
    },

    // 🔹 Application Info
    applicationDeadline: Date,

    applicationInstructions: String,

    // 🔹 Meta
    isFeatured: {
        type: Boolean,
        default: false
    },

    vacancies: {
        type: Number,
        default: 1
    },

    employerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

// 🔍 Text Search Index
JobSchema.index({
    title: 'text',
    description: 'text',
    category: 'text',
    tags: 'text'
});

module.exports = mongoose.model('Job', JobSchema);