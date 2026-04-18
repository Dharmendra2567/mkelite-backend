const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the employer ID']
    },
    contactNumber: {
        type: String,
        required: [true, 'Please add a contact number']
    },
    professionalCategory: {
        type: String,
        required: [true, 'Please add a category']
    },
    candidatesNeeded: {
        type: Number,
        required: [true, 'Please specify how many candidates are needed'],
        min: 1
    },
    deadline: {
        type: Date,
        required: [true, 'Please provide a deadline']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please provide the total amount'],
        default: 0
    },
    jobId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: [true, 'Please provide the Job ID']
    },
    acquiredCandidates: [{
        jobseekerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        applicationId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Application'
        },
        acquiredAt: {
            type: Date,
            default: Date.now
        }
    }],
    orderStatus: {
        type: String,
        enum: ['Pending', 'Active', 'Successful', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    message: {
        type: String,
        maxLength: [1000, 'Message cannot be longer than 1000 characters']
    }
}, {
    timestamps: true
});

OrderSchema.index({ employerId: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
