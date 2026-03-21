const { register, login, refresh, logout, getMe, updateDetails, getEmployers, getUsers, adminCreateUser, adminUpdateUser, deleteUser } = require('./user.controller');
const { protect, authorize } = require('../../middlewares/auth');

// JSON Schema Validation for performance and security (Fastify)
const registerSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'role'],
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phoneNumber: { type: 'string', pattern: '^\\+\\d{1,4}\\d{10}$' },
                password: { type: 'string', minLength: 6 },
                role: { type: 'string', enum: ['jobseeker', 'employer', 'admin'] }
            }
        }
    }
};

const loginSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' }
            }
        }
    }
};

async function userRoutes(fastify, options) {
    fastify.post('/register', registerSchema, register);
    fastify.post('/login', loginSchema, login);
    fastify.get('/refresh', refresh);
    fastify.post('/logout', { preHandler: [protect] }, logout);
    fastify.get('/me', { preHandler: [protect] }, getMe);
    fastify.put('/updatedetails', { preHandler: [protect] }, updateDetails);

    // Admin routes
    fastify.get('/', { preHandler: [protect, authorize(['admin'])] }, getUsers);
    fastify.get('/employers', { preHandler: [protect, authorize(['admin'])] }, getEmployers);
    fastify.post('/admin-create', { preHandler: [protect, authorize(['admin'])] }, adminCreateUser);
    fastify.put('/:id', { preHandler: [protect, authorize(['admin'])] }, adminUpdateUser);
    fastify.delete('/:id', { preHandler: [protect, authorize(['admin'])] }, deleteUser);
}

module.exports = userRoutes;
