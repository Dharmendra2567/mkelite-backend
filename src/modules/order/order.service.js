const Order = require('./order.model');
const ErrorResponse = require('../../utils/errorResponse');

class OrderService {
    async createOrder(orderData, employerId) {
        orderData.employerId = employerId;
        return await Order.create(orderData);
    }

    async getOrdersForEmployer(employerId) {
        return await Order.find({ employerId }).populate('candidatesFound', 'name email').lean();
    }

    async getAllOrders(queryOptions = {}) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOptions;

        return await Order.find(filters)
            .populate('employerId', 'name email')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }

    async updateOrderStatus(id, updateData) {
        const order = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
        if (!order) {
            throw new ErrorResponse('Order not found', 404);
        }
        return order;
    }
}
module.exports = new OrderService();
