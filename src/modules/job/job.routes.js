const { getJobs, getJob, createJob, updateJob, deleteJob } = require('./job.controller');
const { protect, authorize, optionalProtect } = require('../../middlewares/auth');

const createJobSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['title', 'employerProfileId', 'type', 'description', 'category', 'subCategory', 'subSubCategory'],
            properties: {
                title: { type: 'string' },
                employerProfileId: { type: 'string' }, // ObjectId as string
                employerId: { type: 'string' }, // Fix: Allow explicit employerId from admin payload

                location: {
                    type: 'object',
                    properties: {
                        city: { type: 'string' },
                        state: { type: 'string' },
                        country: { type: 'string' },
                        fullAddress: { type: 'string' }
                    }
                },

                type: {
                    type: 'string',
                    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Volunteer']
                },

                workMode: {
                    type: 'string',
                    enum: ['On-site', 'Remote', 'Hybrid']
                },

                salary: {
                    type: 'object',
                    properties: {
                        min: { type: 'number' },
                        max: { type: 'number' },
                        currency: { type: 'string' },
                        period: { type: 'string', enum: ['Hourly', 'Monthly', 'Yearly'] },
                        isNegotiable: { type: 'boolean' }
                    }
                },

                overview: { type: 'string' },
                description: { type: 'string' },
                responsibilities: { type: 'array', items: { type: 'string' } },
                requirements: { type: 'array', items: { type: 'string' } },
                preferredQualifications: { type: 'array', items: { type: 'string' } },
                benefits: { type: 'array', items: { type: 'string' } },

                experience: {
                    type: 'object',
                    properties: {
                        min: { type: 'number' },
                        max: { type: 'number' },
                        unit: { type: 'string' }
                    }
                },

                education: { type: 'string' },

                workDetails: {
                    type: 'object',
                    properties: {
                        shift: { type: 'string' },
                        workingDays: { type: 'string' },
                        hoursPerWeek: { type: 'number' }
                    }
                },

                tags: { type: 'array', items: { type: 'string' } },
                category: { type: 'string' },
                subCategory: { type: 'string' },
                subSubCategory: { type: 'string' },

                companyInfo: {
                    type: 'object',
                    properties: {
                        about: { type: 'string' },
                        website: { type: 'string' },
                        size: { type: 'string' }
                    }
                },

                applicationDeadline: { type: 'string' },
                applicationInstructions: { type: 'string' },
                isFeatured: { type: 'boolean' },
                vacancies: { type: 'number' }
            }
        }
    }
};

async function jobRoutes(fastify, options) {
    // Allow linking of application routes to jobs
    fastify.register(require('../application/application.routes'), { prefix: '/:jobId/applications' });

    fastify.get('/', getJobs);
    fastify.get('/:id', { preHandler: [optionalProtect] }, getJob);
    fastify.post('/', { schema: createJobSchema.schema, preHandler: [protect, authorize('employer')] }, createJob);
    fastify.put('/:id', { preHandler: [protect, authorize('employer')] }, updateJob);
    fastify.delete('/:id', { preHandler: [protect, authorize('employer')] }, deleteJob);
}

module.exports = jobRoutes;
