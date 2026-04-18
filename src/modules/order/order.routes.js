const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, acquireCandidate, activateOrder, removeCandidate } = require('./order.controller');
const { protect, authorize } = require('../../middlewares/auth');

const orderSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['contactNumber', 'professionalCategory', 'candidatesNeeded', 'deadline', 'totalAmount'],
            properties: {
                contactNumber: { type: 'string' },
                professionalCategory: { type: 'string' },
                candidatesNeeded: { type: 'number', minimum: 1 },
                deadline: { type: 'string', format: 'date-time' },
                totalAmount: { type: 'number', minimum: 0 },
                message: { type: 'string', maxLength: 1000 }
            }
        }
    }
};

const updateOrderSchema = {
    schema: {
        body: {
            type: 'object',
            properties: {
                orderStatus: { type: 'string', enum: ['Pending', 'Active', 'Successful', 'Rejected', 'Cancelled'] },
                paymentStatus: { type: 'string', enum: ['Paid', 'Pending'] },
                candidatesFound: { type: 'array', items: { type: 'string' } },
                totalAmount: { type: 'number' },
                message: { type: 'string', maxLength: 1000 }
            }
        }
    }
};

async function orderRoutes(fastify, options) {
    fastify.post('/', { schema: orderSchema.schema, preHandler: [protect, authorize('employer')] }, createOrder);
    fastify.get('/me', { preHandler: [protect, authorize('employer')] }, getMyOrders);
    fastify.post('/acquire', { preHandler: [protect, authorize('employer')] }, acquireCandidate);
    fastify.delete('/acquire/:applicationId', { preHandler: [protect, authorize('employer')] }, removeCandidate);
    fastify.put('/:id/place', { preHandler: [protect, authorize('employer')] }, activateOrder); // Employer can activate pending order

    // Admin routes
    fastify.get('/', { preHandler: [protect, authorize('admin')] }, getAllOrders);
    fastify.put('/:id', { schema: updateOrderSchema.schema, preHandler: [protect, authorize('admin')] }, updateOrderStatus);
}

module.exports = orderRoutes;
