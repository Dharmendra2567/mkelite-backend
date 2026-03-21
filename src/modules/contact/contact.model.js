const mongoose = require('mongoose');

const ContactInquirySchema = new mongoose.Schema({
    userRole: {
        type: String,
        enum: ['jobseeker', 'employer', 'guest'],
        required: [true, 'Please provide a user role']
    },
    name: { type: String, required: [true, 'Please add a name'] },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: { type: String, required: [true, 'Please add a phone number'] },
    location: { type: String },
    subject: { type: String, required: [true, 'Please add a subject'] },
    message: { type: String, required: [true, 'Please add a message'] },

    // -- Employer Specific Fields --
    companyName: { type: String },
    professionalCategory: { type: String },
    candidatesNeeded: { type: Number },

    // -- Jobseeker Specific Fields --
    qualification: { type: String },
    roleNeeded: { type: String },
    resumeUrl: { type: String },

    status: {
        type: String,
        enum: ['new', 'read', 'replied'],
        default: 'new'
    }
}, {
    timestamps: true
});

ContactInquirySchema.index({ email: 1, userRole: 1 });

module.exports = mongoose.model('ContactInquiry', ContactInquirySchema);
