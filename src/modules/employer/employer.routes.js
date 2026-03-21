const { createProfile, getMyProfile, updateMyProfile, getProfileById, getProfiles } = require('./employer.controller');
const { protect, authorize } = require('../../middlewares/auth');

async function employerRoutes(fastify, options) {
    // Create a new company profile (admin or employer)
    fastify.post('/', { preHandler: [protect, authorize('employer', 'admin')] }, createProfile);

    // Self-service: employer manages their own profile
    fastify.get('/me', { preHandler: [protect, authorize('employer')] }, getMyProfile);
    fastify.put('/me', { preHandler: [protect, authorize('employer')] }, updateMyProfile);

    // Anyone authenticated can browse profiles (dropdowns etc.)
    fastify.get('/', { preHandler: [protect] }, getProfiles);
    fastify.get('/:id', { preHandler: [protect] }, getProfileById);
}

module.exports = employerRoutes;
