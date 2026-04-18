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
    const order = await orderService.updateOrderStatus(request.params.id, request.body, request.user.role);
    return {
        success: true,
        message: `Order status updated successfully`,
        data: order
    };
};

exports.activateOrder = async (request, reply) => {
    // Force status to Active for employer activation
    const order = await orderService.updateOrderStatus(request.params.id, { orderStatus: 'Active' }, 'employer');
    return {
        success: true,
        message: 'Order activated successfully',
        data: order
    };
};

exports.acquireCandidate = async (request, reply) => {
    const { applicationId } = request.body;
    const order = await orderService.acquireCandidate(applicationId, request.user.id);
    return {
        success: true,
        message: 'Candidate acquired successfully',
        data: order
    };
};

exports.removeCandidate = async (request, reply) => {
    const { applicationId } = request.params;
    const order = await orderService.removeCandidate(applicationId, request.user.id);
    return {
        success: true,
        message: 'Candidate removed from order successfully',
        data: order
    };
};
