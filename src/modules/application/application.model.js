const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: true
    },
    jobseekerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Nullable for Guest mode
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    qualification: { type: String },
    education: { type: String },
    resume: {
        type: String,
        required: [true, 'Please add a resume link']
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Interviewing', 'Shortlisted', 'Rejected', 'Accepted'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// We can no longer have a strict unique index on just (jobId, jobseekerId) because guests will have nullable jobseekerId!
ApplicationSchema.index({ jobId: 1, email: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
