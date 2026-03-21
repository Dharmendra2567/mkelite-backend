const orderService = require('./order.service');
const ErrorResponse = require('../../utils/errorResponse');

exports.createOrder = async (request, reply) => {
    if (request.user.role !== 'employer') {
        throw new ErrorResponse('Only employers can create placement orders', 403);
    }
    const order = await orderService.createOrder(request.body, request.user.id);
    reply.status(201).send({
        success: true,
        message: 'Placement order created successfully',
        data: order
    });
};

exports.getMyOrders = async (request, reply) => {
    if (request.user.role !== 'employer') {
        throw new ErrorResponse('Only employers can view their orders', 403);
    }
    const orders = await orderService.getOrdersForEmployer(request.user.id);
    return {
        success: true,
        message: 'Your orders retrieved successfully',
        count: orders.length,
        data: orders
    };
};

exports.getAllOrders = async (request, reply) => {
    const orders = await orderService.getAllOrders(request.query);
    return {
        success: true,
        message: 'All placement orders retrieved successfully',
        count: orders.length,
        data: orders
    };
};

exports.updateOrderStatus = async (request, reply) => {
    const order = await orderService.updateOrderStatus(request.params.id, request.body);
    return {
        success: true,
        message: `Order status updated to ${request.body.status || 'updated'}`,
        data: order
    };
};
