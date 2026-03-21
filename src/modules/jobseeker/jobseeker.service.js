const JobseekerProfile = require('./jobseeker.model');
const ErrorResponse = require('../../utils/errorResponse');

class JobseekerService {
    async createProfile(userId, profileData) {
        // Ensure user doesn't already have a profile
        let profile = await JobseekerProfile.findOne({ userId }).lean();

        if (profile) {
            throw new ErrorResponse('Profile already exists for this user', 400);
        }

        profileData.userId = userId;
        profile = await JobseekerProfile.create(profileData);
        return profile;
    }

    async getProfileByUserId(userId) {
        const profile = await JobseekerProfile.findOne({ userId }).lean(); // .lean() for 10k req/s optimization

        if (!profile) {
            throw new ErrorResponse('Jobseeker profile not found', 404);
        }

        return profile;
    }

    async getProfileById(id) {
        const profile = await JobseekerProfile.findById(id).lean();

        if (!profile) {
            throw new ErrorResponse('Jobseeker profile not found', 404);
        }

        return profile;
    }

    async updateProfile(userId, updateData) {
        let profile = await JobseekerProfile.findOne({ userId });

        if (!profile) {
            throw new ErrorResponse('Jobseeker profile not found', 404);
        }

        profile = await JobseekerProfile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, runValidators: true }
        ).lean();

        return profile;
    }

    async getAllProfiles(queryOps) {
        // High performance search mapping
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOps;

        const profiles = await JobseekerProfile.find(filters)
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();

        return profiles;
    }
}

module.exports = new JobseekerService();
