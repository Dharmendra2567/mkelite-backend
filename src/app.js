require('dotenv').config();
const fastify = require('fastify');
const { loggerConfig } = require('./config/logger');

const app = fastify({
    logger: loggerConfig
});

// Register plugins
app.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});
app.register(require('@fastify/helmet'));
app.register(require('@fastify/compress'));
app.register(require('@fastify/cookie'));
app.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '10 minutes'
});

// JWT
app.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
});

// Multi-part for file uploads
app.register(require('@fastify/multipart'), {
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Routes (Domain Driven)
const userRoutes = require('./modules/user/user.routes');
const jobseekerRoutes = require('./modules/jobseeker/jobseeker.routes');
const employerRoutes = require('./modules/employer/employer.routes');
const jobRoutes = require('./modules/job/job.routes');
const { globalApplicationRoutes } = require('./modules/application/application.routes');

const categoryRoutes = require('./modules/category/category.routes');
const contactRoutes = require('./modules/contact/contact.routes');
const employerLeadRoutes = require('./modules/employer-lead/employer-lead.routes');
const orderRoutes = require('./modules/order/order.routes');
const placementRoutes = require('./modules/placement/placement.routes');
const uploadRoutes = require('./modules/upload/upload.routes');

app.register(userRoutes, { prefix: '/api/v1/auth' }); // Maintaining /auth for backwards compatibility
app.register(jobseekerRoutes, { prefix: '/api/v1/jobseeker' });
app.register(employerRoutes, { prefix: '/api/v1/employer' });
app.register(employerRoutes, { prefix: '/api/v1/employer-profiles' }); // used by frontend dropdowns
app.register(jobRoutes, { prefix: '/api/v1/jobs' });
app.register(globalApplicationRoutes, { prefix: '/api/v1/applications' });

app.register(categoryRoutes, { prefix: '/api/v1/categories' });
app.register(contactRoutes, { prefix: '/api/v1/contact' });
app.register(employerLeadRoutes, { prefix: '/api/v1/employer-leads' });
app.register(orderRoutes, { prefix: '/api/v1/orders' });
app.register(placementRoutes, { prefix: '/api/v1/placements' });
app.register(uploadRoutes, { prefix: '/api/v1/upload' });

// Health check
app.get('/api/health', async (request, reply) => {
    return { success: true, message: 'Server is healthy' };
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
        success: false,
        message: error.message || 'Internal Server Error',
        data: null
    });
});

module.exports = app;
