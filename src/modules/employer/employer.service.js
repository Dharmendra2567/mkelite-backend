const EmployerProfile = require('./employer.model');
const ErrorResponse = require('../../utils/errorResponse');

class EmployerService {
    async createProfile(userId, profileData) {
        // Allow multiple company profiles per user (admin/employer can own many companies)
        profileData.userId = userId;
        const profile = await EmployerProfile.create(profileData);
        return profile;
    }

    async getProfileByUserId(userId) {
        const profile = await EmployerProfile.findOne({ userId }).lean();

        if (!profile) {
            throw new ErrorResponse('Employer profile not found', 404);
        }

        return profile;
    }

    async getProfileById(id) {
        const profile = await EmployerProfile.findById(id).lean();

        if (!profile) {
            throw new ErrorResponse('Employer profile not found', 404);
        }

        return profile;
    }

    async updateProfile(userId, updateData) {
        let profile = await EmployerProfile.findOne({ userId });

        if (!profile) {
            throw new ErrorResponse('Employer profile not found', 404);
        }

        profile = await EmployerProfile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, runValidators: true }
        ).lean();

        return profile;
    }

    async getAllProfiles(queryOps) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOps;

        const profiles = await EmployerProfile.find(filters)
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();

        return profiles;
    }
}

module.exports = new EmployerService();
