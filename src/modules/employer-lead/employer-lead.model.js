const mongoose = require('mongoose');

const EmployerLeadSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    demand: { type: String, required: true },
    candidatesNeeded: { type: Number, required: true, min: 1 },
    role: { type: String, required: true },
    salary: { type: String },
    location: { type: String, required: true }
}, {
    timestamps: true
});

EmployerLeadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmployerLead', EmployerLeadSchema);
