const placementService = require('./placement.service');

exports.createPlacement = async (request, reply) => {
    const placement = await placementService.createPlacement(request.body);
    reply.status(201).send({
        success: true,
        message: 'Success story/placement added successfully',
        data: placement
    });
};

exports.getPlacements = async (request, reply) => {
    const placements = await placementService.getPlacements(request.query);
    return {
        success: true,
        message: 'Recent placements retrieved successfully',
        count: placements.length,
        data: placements
    };
};

exports.deletePlacement = async (request, reply) => {
    await placementService.deletePlacement(request.params.id);
    return {
        success: true,
        message: 'Placement entry removed successfully',
        data: null
    };
};
