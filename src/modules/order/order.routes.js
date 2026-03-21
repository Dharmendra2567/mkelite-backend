const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('./order.controller');
const { protect, authorize } = require('../../middlewares/auth');

const orderSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['contactNumber', 'professionalCategory', 'candidatesNeeded', 'totalAmount'],
            properties: {
                contactNumber: { type: 'string' },
                professionalCategory: { type: 'string' },
                candidatesNeeded: { type: 'number', minimum: 1 },
                totalAmount: { type: 'string' }
            }
        }
    }
};

const updateOrderSchema = {
    schema: {
        body: {
            type: 'object',
            properties: {
                orderStatus: { type: 'string', enum: ['Placed', 'Pending', 'Fulfilled'] },
                paymentStatus: { type: 'string', enum: ['Paid', 'Pending'] },
                candidatesFound: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};

async function orderRoutes(fastify, options) {
    fastify.post('/', { schema: orderSchema.schema, preHandler: [protect, authorize('employer')] }, createOrder);
    fastify.get('/me', { preHandler: [protect, authorize('employer')] }, getMyOrders);

    // Admin routes
    fastify.get('/', { preHandler: [protect, authorize('admin')] }, getAllOrders);
    fastify.put('/:id', { schema: updateOrderSchema.schema, preHandler: [protect, authorize('admin')] }, updateOrderStatus);
}

module.exports = orderRoutes;
