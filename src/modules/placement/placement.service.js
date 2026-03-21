const Placement = require('./placement.model');
const ErrorResponse = require('../../utils/errorResponse');

class PlacementService {
    async createPlacement(data) {
        return await Placement.create(data);
    }

    async getPlacements(queryOptions = {}) {
        const { limit = 10, skip = 0, sort = '-createdAt', ...filters } = queryOptions;

        return await Placement.find(filters)
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }

    async deletePlacement(id) {
        const placement = await Placement.findByIdAndDelete(id).lean();
        if (!placement) {
            throw new ErrorResponse('Placement not found', 404);
        }
        return placement;
    }
}

module.exports = new PlacementService();
