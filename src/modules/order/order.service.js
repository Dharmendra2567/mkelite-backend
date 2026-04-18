const Order = require('./order.model');
const Application = require('../application/application.model');
const ErrorResponse = require('../../utils/errorResponse');

class OrderService {
    async createOrder(orderData, employerId) {
        orderData.employerId = employerId;
        return await Order.create(orderData);
    }

    async getOrdersForEmployer(employerId) {
        return await Order.find({ employerId })
            .populate('jobId', 'title category')
            .populate('acquiredCandidates.jobseekerId', 'firstName lastName email')
            .sort('-createdAt')
            .lean();
    }

    async getAllOrders(queryOptions = {}) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOptions;

        return await Order.find(filters)
            .populate('employerId', 'firstName lastName email')
            .populate('jobId', 'title category')
            .populate('acquiredCandidates.jobseekerId', 'firstName lastName email')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }

    async updateOrderStatus(id, updateData, userRole = 'admin') {
        const order = await Order.findById(id);
        if (!order) {
            throw new ErrorResponse('Order not found', 404);
        }

        // If employer is moving to 'Active', it's like "Placing" the order
        if (userRole === 'employer' && updateData.orderStatus === 'Active') {
            updateData.paymentStatus = 'Paid';
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
        return updatedOrder;
    }

    async acquireCandidate(applicationId, employerId) {
        const application = await Application.findById(applicationId).populate('jobId');
        if (!application) throw new ErrorResponse('Application not found', 404);

        // Verification: ensure employer owns the job
        if (application.jobId.employerId.toString() !== employerId.toString()) {
            throw new ErrorResponse('Not authorized to acquire this candidate', 403);
        }

        // Find or create order for this specific job
        let order = await Order.findOne({ jobId: application.jobId._id, employerId });

        if (!order) {
            // Auto-create a Pending order for this job if it doesn't exist
            order = await Order.create({
                employerId,
                jobId: application.jobId._id,
                contactNumber: application.jobId.contactNumber || 'N/A',
                professionalCategory: application.jobId.category?.name || 'Recruitment',
                candidatesNeeded: 1, 
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
                totalAmount: 0,
                orderStatus: 'Pending'
            });
        }

        // Link the candidate and application
        const alreadyAcquired = order.acquiredCandidates.some(c => c.applicationId?.toString() === applicationId.toString());
        if (!alreadyAcquired) {
            order.acquiredCandidates.push({
                jobseekerId: application.jobseekerId,
                applicationId: application._id
            });
            await order.save();
        }

        return order;
    }

    async removeCandidate(applicationId, employerId) {
        const order = await Order.findOne({ 
            employerId, 
            'acquiredCandidates.applicationId': applicationId 
        });

        if (!order) {
            throw new ErrorResponse('Acquired candidate not found in any of your orders', 404);
        }

        order.acquiredCandidates = order.acquiredCandidates.filter(
            c => c.applicationId?.toString() !== applicationId.toString()
        );
        
        await order.save();
        return order;
    }
}
module.exports = new OrderService();
