const { createApplication, getApplicationsForJob, getMyApplications, getAllApplications, updateApplicationStatus, deleteApplication, withdrawApplication } = require('./application.controller');
const { protect, authorize, optionalProtect } = require('../../middlewares/auth');

const applySchema = {
    schema: {
        body: {
            type: 'object',
            required: ['resume', 'name', 'email', 'phone'],
            properties: {
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string', minLength: 10 },
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

    // Allow guests to apply (optionalProtect populates request.user if token is present)
    fastify.post('/', { schema: applySchema.schema, preHandler: [optionalProtect] }, createApplication);
    
    // View applications for a specific job (Employer/Admin only)
    fastify.get('/', { preHandler: [protect, authorize('employer', 'admin')] }, getApplicationsForJob);
}

module.exports = applicationRoutes;

// Global application routes (mounted at /api/v1/applications)
module.exports.globalApplicationRoutes = async function (fastify, options) {
    fastify.get('/me', { preHandler: [protect, authorize('jobseeker', 'admin')] }, getMyApplications);

    // Global filters (Admin: All, Employer: Their jobs)
    fastify.get('/', { preHandler: [protect, authorize('admin', 'employer')] }, getAllApplications);
    
    fastify.put('/:id', { preHandler: [protect, authorize('admin', 'employer')] }, updateApplicationStatus);
    fastify.delete('/:id', { preHandler: [protect, authorize('admin')] }, deleteApplication);
    
    // Withdraw application (Jobseeker own)
    fastify.delete('/withdraw/:id', { preHandler: [protect, authorize('jobseeker')] }, withdrawApplication);
};
