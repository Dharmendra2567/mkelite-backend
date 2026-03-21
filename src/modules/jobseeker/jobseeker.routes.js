const { createProfile, getMyProfile, updateMyProfile, getProfileById, getProfiles } = require('./jobseeker.controller');
const { protect, authorize } = require('../../middlewares/auth');

const profileSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string' },
                specialization: { type: 'string' },
                location: { type: 'string' },
                bio: { type: 'string' },
                phone: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                experience: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['company', 'role', 'period'],
                        properties: {
                            company: { type: 'string' },
                            role: { type: 'string' },
                            period: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                },
                education: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['school', 'degree', 'year'],
                        properties: {
                            school: { type: 'string' },
                            degree: { type: 'string' },
                            year: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};

async function jobseekerRoutes(fastify, options) {
    // Only jobseekers can create or update their own profiles
    fastify.post('/', { schema: profileSchema.schema, preHandler: [protect, authorize('jobseeker')] }, createProfile);
    fastify.get('/me', { preHandler: [protect, authorize('jobseeker')] }, getMyProfile);
    fastify.put('/me', { schema: profileSchema.schema, preHandler: [protect, authorize('jobseeker')] }, updateMyProfile);

    // Anyone authenticated can view profiles
    fastify.get('/', { preHandler: [protect] }, getProfiles);
    fastify.get('/:id', { preHandler: [protect] }, getProfileById);
}

module.exports = jobseekerRoutes;
