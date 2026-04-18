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
    const userId = request.user.id;
    const profile = await jobseekerService.getProfileByUserId(userId);

    return {
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
    };
};

exports.updateMyProfile = async (request, reply) => {
    const userId = request.user.id;
    const profile = await jobseekerService.updateProfile(userId, request.body);

    return {
        success: true,
        message: 'Profile updated successfully',
        data: profile
    };
};

exports.toggleSaveJob = async (request, reply) => {
    const userId = request.user.id;
    const { jobId } = request.params;

    const savedJobs = await jobseekerService.toggleSaveJob(userId, jobId);

    return {
        success: true,
        message: 'Job save status updated',
        data: savedJobs
    };
};

// --- RESUME MANAGEMENT ---
exports.addResume = async (request, reply) => {
    const resumes = await jobseekerService.addResume(request.user.id, request.body);
    return {
        success: true,
        message: 'Resume added successfully',
        data: resumes
    };
};

exports.deleteResume = async (request, reply) => {
    const resumes = await jobseekerService.deleteResume(request.user.id, request.params.resumeId);
    return {
        success: true,
        message: 'Resume deleted successfully',
        data: resumes
    };
};

exports.setDefaultResume = async (request, reply) => {
    const resumes = await jobseekerService.setDefaultResume(request.user.id, request.params.resumeId);
    return {
        success: true,
        message: 'Default resume updated',
        data: resumes
    };
};

// --- SECTION MANAGEMENT ---
exports.addExperience = async (request, reply) => {
    const experience = await jobseekerService.addExperience(request.user.id, request.body);
    return {
        success: true,
        message: 'Experience added successfully',
        data: experience
    };
};

exports.removeExperience = async (request, reply) => {
    const experience = await jobseekerService.removeExperience(request.user.id, request.params.expId);
    return {
        success: true,
        message: 'Experience removed successfully',
        data: experience
    };
};

exports.updateExperience = async (request, reply) => {
    const experience = await jobseekerService.updateExperience(request.user.id, request.params.expId, request.body);
    return {
        success: true,
        message: 'Experience updated successfully',
        data: experience
    };
};

exports.addEducation = async (request, reply) => {
    const education = await jobseekerService.addEducation(request.user.id, request.body);
    return {
        success: true,
        message: 'Education added successfully',
        data: education
    };
};

exports.removeEducation = async (request, reply) => {
    const education = await jobseekerService.removeEducation(request.user.id, request.params.eduId);
    return {
        success: true,
        message: 'Education removed successfully',
        data: education
    };
};

exports.updateEducation = async (request, reply) => {
    const education = await jobseekerService.updateEducation(request.user.id, request.params.eduId, request.body);
    return {
        success: true,
        message: 'Education updated successfully',
        data: education
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
