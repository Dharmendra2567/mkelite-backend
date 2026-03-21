const { createLead, getLeads } = require('./employer-lead.controller');
const { protect, authorize } = require('../../middlewares/auth');

const leadSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['companyName', 'contactName', 'email', 'demand', 'candidatesNeeded', 'role', 'location'],
            properties: {
                companyName: { type: 'string' },
                contactName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                demand: { type: 'string' },
                candidatesNeeded: { type: 'number', minimum: 1 },
                role: { type: 'string' },
                salary: { type: 'string' },
                location: { type: 'string' }
            }
        }
    }
};

async function employerLeadRoutes(fastify, options) {
    fastify.post('/', { schema: leadSchema.schema }, createLead);
    fastify.get('/', { preHandler: [protect, authorize('admin')] }, getLeads);
}

module.exports = employerLeadRoutes;
