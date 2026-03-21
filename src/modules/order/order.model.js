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
        required: true,
        min: 1
    },
    candidatesFound: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Pending', 'Fulfilled'],
        default: 'Placed'
    },
    totalAmount: {
        type: String, // String or Decimal depending on preference for exact currency representation
        required: true
    }
}, {
    timestamps: true
});

OrderSchema.index({ employerId: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
