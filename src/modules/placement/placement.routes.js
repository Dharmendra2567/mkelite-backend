const { createPlacement, getPlacements, deletePlacement } = require('./placement.controller');
const { protect, authorize } = require('../../middlewares/auth');

const placementSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['name', 'role', 'placedCompany'],
            properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                avatar: { type: 'string' },
                placedCompany: { type: 'string' }
            }
        }
    }
};

async function placementRoutes(fastify, options) {
    // Public routes to view success stories
    fastify.get('/', getPlacements);

    // Protected Admin routes
    fastify.post('/', { schema: placementSchema.schema, preHandler: [protect, authorize('admin')] }, createPlacement);
    fastify.delete('/:id', { preHandler: [protect, authorize('admin')] }, deletePlacement);
}

module.exports = placementRoutes;
