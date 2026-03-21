const { createInquiry, getInquiries, updateStatus } = require('./contact.controller');
const { protect, authorize } = require('../../middlewares/auth');

const inquirySchema = {
    schema: {
        body: {
            type: 'object',
            required: ['userRole', 'name', 'email', 'phone', 'subject', 'message'],
            properties: {
                userRole: { type: 'string', enum: ['jobseeker', 'employer', 'guest'] },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                location: { type: 'string' },
                subject: { type: 'string' },
                message: { type: 'string' },
                companyName: { type: 'string' },
                professionalCategory: { type: 'string' },
                candidatesNeeded: { type: 'number' },
                qualification: { type: 'string' },
                roleNeeded: { type: 'string' },
                resumeUrl: { type: 'string' }
            }
        }
    }
};

const statusSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['status'],
            properties: {
                status: { type: 'string', enum: ['new', 'read', 'replied'] }
            }
        }
    }
};

async function contactRoutes(fastify, options) {
    // Public route to submit inquiries
    fastify.post('/', { schema: inquirySchema.schema }, createInquiry);

    // Protected admin routes for reviewing
    fastify.get('/', { preHandler: [protect, authorize('admin')] }, getInquiries);
    fastify.put('/:id/status', { schema: statusSchema.schema, preHandler: [protect, authorize('admin')] }, updateStatus);
}

module.exports = contactRoutes;
