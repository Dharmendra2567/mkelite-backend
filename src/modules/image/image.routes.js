const { 
    getImages, 
    getImageByTag, 
    uploadImage, 
    updateImage, 
    deleteImage 
} = require('./image.controller');
const { protect, authorize } = require('../../middlewares/auth');

const imageRoutes = async (fastify, options) => {
    // Public routes
    fastify.get('/', getImages);
    fastify.get('/tag/:tag', getImageByTag);

    // Protected Admin routes
    fastify.post('/', { preHandler: [protect, authorize('admin')] }, uploadImage);
    fastify.put('/:id', { preHandler: [protect, authorize('admin')] }, updateImage);
    fastify.delete('/:id', { preHandler: [protect, authorize('admin')] }, deleteImage);
};

module.exports = imageRoutes;
