console.error('DEVELOPER_LOG: LOADING JOBSEEKER ROUTES FILE');
const { 
    createProfile, 
    getMyProfile, 
    updateMyProfile, 
    getProfileById, 
    getProfiles, 
    toggleSaveJob,
    addResume,
    deleteResume,
    setDefaultResume,
    addExperience,
    removeExperience,
    updateExperience,
    addEducation,
    removeEducation,
    updateEducation
} = require('./jobseeker.controller');
const { protect, authorize } = require('../../middlewares/auth');

const profileProperties = {
    name: { type: 'string' },
    avatar: { type: 'string' },
    headline: { type: 'string' },
    bio: { type: 'string' },
    phone: { type: 'string' },
    location: {
        type: 'object',
        properties: {
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' }
        }
    },
    skills: { type: 'array', items: { type: 'string' } },
    languages: { type: 'array', items: { type: 'string' } },
    experience: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                company: { type: 'string' },
                role: { type: 'string' },
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
                currentlyWorking: { type: 'boolean' },
                description: { type: 'string' },
                workMode: { type: 'string', enum: ['Remote', 'Onsite', 'Hybrid'] },
                location: { type: 'string' }
            }
        }
    },
    education: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                institution: { type: 'string' },
                degree: { type: 'string' },
                fieldOfStudy: { type: 'string' },
                startYear: { type: 'number' },
                endYear: { type: 'number' }
            }
        }
    },
    resumes: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                url: { type: 'string' },
                fileName: { type: 'string' },
                isDefault: { type: 'boolean' }
            }
        }
    },
    preferences: {
        type: 'object',
        properties: {
            jobTypes: { type: 'array', items: { type: 'string' } },
            workModes: { type: 'array', items: { type: 'string' } },
            preferredLocations: { type: 'array', items: { type: 'string' } },
            expectedSalary: {
                type: 'object',
                properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    currency: { type: 'string' }
                }
            }
        }
    },
    isActivelyLooking: { type: 'boolean' },
    profileVisibility: { type: 'string', enum: ['Public', 'Private', 'Recruiters Only'] }
};

const createProfileSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['name'],
            properties: profileProperties
        }
    }
};

const updateProfileSchema = {
    schema: {
        body: {
            type: 'object',
            required: [],
            properties: profileProperties
        }
    }
};

const experienceSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['company', 'role'],
            properties: {
                company: { type: 'string' },
                role: { type: 'string' },
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
                currentlyWorking: { type: 'boolean' },
                description: { type: 'string' },
                workMode: { type: 'string', enum: ['Remote', 'Onsite', 'Hybrid'] },
                location: { type: 'string' }
            }
        }
    }
};

const educationSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['institution', 'degree'],
            properties: {
                institution: { type: 'string' },
                degree: { type: 'string' },
                fieldOfStudy: { type: 'string' },
                startYear: { type: 'number' },
                endYear: { type: 'number' }
            }
        }
    }
};

const resumeSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['url', 'fileName'],
            properties: {
                url: { type: 'string' },
                fileName: { type: 'string' },
                isDefault: { type: 'boolean' }
            }
        }
    }
};

async function jobseekerRoutes(fastify, options) {
    // Basic Profile Operations
    fastify.post('/', { schema: createProfileSchema.schema, preHandler: [protect, authorize('jobseeker')] }, createProfile);
    fastify.get('/me', { preHandler: [protect, authorize('jobseeker')] }, getMyProfile);
    fastify.put('/me', { schema: updateProfileSchema.schema, preHandler: [protect, authorize('jobseeker')] }, updateMyProfile);

    // Job Interactions
    fastify.post('/save-job/:jobId', { preHandler: [protect, authorize('jobseeker')] }, toggleSaveJob);

    // Resume Management
    fastify.post('/resumes', { schema: resumeSchema.schema, preHandler: [protect, authorize('jobseeker')] }, addResume);
    fastify.delete('/resumes/:resumeId', { preHandler: [protect, authorize('jobseeker')] }, deleteResume);
    fastify.patch('/resumes/:resumeId/default', { preHandler: [protect, authorize('jobseeker')] }, setDefaultResume);

    // Section Management - Experience
    fastify.post('/experience', { schema: experienceSchema.schema, preHandler: [protect, authorize('jobseeker')] }, addExperience);
    fastify.put('/experience/:expId', { schema: experienceSchema.schema, preHandler: [protect, authorize('jobseeker')] }, updateExperience);
    fastify.delete('/experience/:expId', { preHandler: [protect, authorize('jobseeker')] }, removeExperience);

    // Section Management - Education
    fastify.post('/education', { schema: educationSchema.schema, preHandler: [protect, authorize('jobseeker')] }, addEducation);
    fastify.put('/education/:eduId', { schema: educationSchema.schema, preHandler: [protect, authorize('jobseeker')] }, updateEducation);
    fastify.delete('/education/:eduId', { preHandler: [protect, authorize('jobseeker')] }, removeEducation);

    // Discovery
    fastify.get('/', { preHandler: [protect] }, getProfiles);
    fastify.get('/:id', { preHandler: [protect] }, getProfileById);
}

module.exports = jobseekerRoutes;
