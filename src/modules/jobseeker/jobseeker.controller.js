const jobseekerService = require('./jobseeker.service');

exports.createProfile = async (request, reply) => {
    // Only jobseekers can create this profile
    if (request.user.role !== 'jobseeker') {
        reply.status(403).send({
            success: false,
            message: 'Only jobseekers can create this profile',
            data: null
        });
        return;
    }

    const profile = await jobseekerService.createProfile(request.user.id, request.body);

    reply.status(201).send({
        success: true,
        message: 'Jobseeker profile created successfully',
        data: profile
    });
};

exports.getMyProfile = async (request, reply) => {
    const profile = await jobseekerService.getProfileByUserId(request.user.id);

    return {
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
    };
};

exports.updateMyProfile = async (request, reply) => {
    const profile = await jobseekerService.updateProfile(request.user.id, request.body);

    return {
        success: true,
        message: 'Profile updated successfully',
        data: profile
    };
};

exports.getProfileById = async (request, reply) => {
    const profile = await jobseekerService.getProfileById(request.params.id);

    return {
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
    };
};

exports.getProfiles = async (request, reply) => {
    const profiles = await jobseekerService.getAllProfiles(request.query);

    return {
        success: true,
        message: `Successfully retrieved ${profiles.length} profiles`,
        count: profiles.length,
        data: profiles
    };
};
