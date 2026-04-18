const { uploadFile } = require('./upload.controller');
const { protect } = require('../../middlewares/auth');

async function uploadRoutes(fastify, options) {
    fastify.post('', uploadFile);
}

module.exports = uploadRoutes;
