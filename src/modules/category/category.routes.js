const { createCategory, getCategories, getCategoryTree, getCategoryById, updateCategory, deleteCategory } = require('./category.controller');
const { protect, authorize } = require('../../middlewares/auth');

const categorySchema = {
    schema: {
        body: {
            type: 'object',
            required: ['name', 'level'],
            properties: {
                name: { type: 'string' },
                level: { type: 'string', enum: ['industry', 'department', 'role'] },
                parentId: { type: 'string', nullable: true }, // Foreign key string
                icon: { type: 'string' },
                count: { type: 'number' }
            }
        }
    }
};

async function categoryRoutes(fastify, options) {
    // Public routes
    fastify.get('/', getCategories);         // Fetches flat list (can use ?level=industry in query)
    fastify.get('/tree', getCategoryTree);   // Returns nested industry -> department -> role layout
    fastify.get('/:id', getCategoryById);

    // Protected admin routes logically
    fastify.post('/', { schema: categorySchema.schema, preHandler: [protect, authorize('admin')] }, createCategory);
    fastify.put('/:id', { preHandler: [protect, authorize('admin')] }, updateCategory);
    fastify.delete('/:id', { preHandler: [protect, authorize('admin')] }, deleteCategory);
}

module.exports = categoryRoutes;
