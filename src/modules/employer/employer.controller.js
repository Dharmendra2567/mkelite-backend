const employerService = require('./employer.service');
const ErrorResponse = require('../../utils/errorResponse');

exports.createProfile = async (request, reply) => {
    const { role, id: reqUserId } = request.user;

    // Determine whose userId this profile belongs to
    // Admin can pass an explicit userId in the body; employer uses their own
    let profileUserId = reqUserId;
    if (role === 'admin' && request.body.userId) {
        profileUserId = request.body.userId;
    } else if (role !== 'employer' && role !== 'admin') {
        return reply.status(403).send({
            success: false,
            message: 'Only employers and admins can create company profiles',
            data: null
        });
    }

    const profile = await employerService.createProfile(profileUserId, request.body);

    reply.status(201).send({
        success: true,
        message: 'Company profile created successfully',
        data: profile
    });
};

exports.getMyProfile = async (request, reply) => {
    const profile = await employerService.getProfileByUserId(request.user.id);
    return { success: true, message: 'Profile retrieved successfully', data: profile };
};

exports.updateMyProfile = async (request, reply) => {
    const profile = await employerService.updateProfile(request.user.id, request.body);
    return { success: true, message: 'Profile updated successfully', data: profile };
};

exports.getProfileById = async (request, reply) => {
    const profile = await employerService.getProfileById(request.params.id);
    return { success: true, message: 'Profile retrieved successfully', data: profile };
};

exports.getProfiles = async (request, reply) => {
    const profiles = await employerService.getAllProfiles(request.query);
    return {
        success: true,
        message: `Successfully retrieved ${profiles.length} profiles`,
        count: profiles.length,
        data: profiles
    };
};
