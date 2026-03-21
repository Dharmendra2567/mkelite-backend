const { createApplication, getApplicationsForJob, getMyApplications, getAllApplications, updateApplicationStatus, deleteApplication } = require('./application.controller');
const { protect, authorize } = require('../../middlewares/auth');

const applySchema = {
    schema: {
        body: {
            type: 'object',
            required: ['resume', 'name', 'email', 'phone'],
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                qualification: { type: 'string' },
                education: { type: 'string' },
                resume: { type: 'string' },
                coverLetter: { type: 'string' }
            }
        }
    }
};

async function applicationRoutes(fastify, options) {
    // These routes will receive /api/v1/jobs/:jobId/applications as prefix

    fastify.post('/', { schema: applySchema.schema, preHandler: [protect, authorize('jobseeker')] }, createApplication);
    fastify.get('/', { preHandler: [protect, authorize('employer', 'admin')] }, getApplicationsForJob);
}

module.exports = applicationRoutes;

// Global application routes (mounted at /api/v1/applications)
module.exports.globalApplicationRoutes = async function (fastify, options) {
    fastify.get('/me', { preHandler: [protect, authorize('jobseeker')] }, getMyApplications);

    // Admin-only routes
    fastify.get('/', { preHandler: [protect, authorize('admin')] }, getAllApplications);
    fastify.put('/:id', { preHandler: [protect, authorize('admin', 'employer')] }, updateApplicationStatus);
    fastify.delete('/:id', { preHandler: [protect, authorize('admin')] }, deleteApplication);
};
