const jobService = require('./job.service');
const EmployerProfile = require('../employer/employer.model');
const ErrorResponse = require('../../utils/errorResponse');

// GET /jobs
exports.getJobs = async (request, reply) => {
    const jobs = await jobService.getJobs(request.query || {});
    const total = await jobService.countJobs(request.query || {});

    return {
        success: true,
        message: `Successfully retrieved ${jobs.length} jobs`,
        count: jobs.length,
        total,
        data: jobs
    };
};

// GET /jobs/:id
exports.getJob = async (request, reply) => {
    const userId = request.user ? request.user.id : null;
    const job = await jobService.getJobById(request.params.id, userId);
    return {
        success: true,
        message: 'Job details retrieved successfully',
        data: job
    };
};

// POST /jobs
exports.createJob = async (request, reply) => {
    const { role, id: userId } = request.user;

    if (role !== 'employer' && role !== 'admin') {
        throw new ErrorResponse('Only employers and admins can create jobs', 403);
    }

    const { employerProfileId, employerId: bodyEmployerId, ...jobData } = request.body;

    let jobOwnerId;
    if (employerProfileId) {
        const profile = await EmployerProfile.findById(employerProfileId);
        if (!profile) {
            throw new ErrorResponse('Employer profile not found', 404);
        }

        // Non-admins can only post under their own profile
        if (role !== 'admin' && profile.userId.toString() !== userId) {
            throw new ErrorResponse('You are not authorized to post jobs for this company profile', 403);
        }
        
        jobOwnerId = (role === 'admin') ? (bodyEmployerId || profile.userId) : userId;
    } else {
        // If no profile, it's just a generic job post. Admin can still assign an owner.
        jobOwnerId = (role === 'admin') ? (bodyEmployerId || userId) : userId;
    }

    const job = await jobService.createJob(
        { ...jobData, employerProfileId },
        jobOwnerId
    );

    reply.status(201).send({
        success: true,
        message: 'Job created successfully',
        data: job
    });
};

// PUT /jobs/:id
exports.updateJob = async (request, reply) => {
    const job = await jobService.getJobById(request.params.id);

    if (!job) {
        throw new ErrorResponse('Job not found', 404);
    }

    // Authorization: must be the user who created the job, or admin
    if (job.employerId && job.employerId.toString() !== request.user.id && request.user.role !== 'admin') {
        throw new ErrorResponse('Not authorized to update this job', 403);
    }

    // If admin is updating, and it's a company profile change, ensure the employerId follows the new profile
    const updates = { ...request.body };
    if (request.user.role === 'admin' && updates.employerProfileId) {
        const profile = await EmployerProfile.findById(updates.employerProfileId);
        if (profile) {
            updates.employerId = profile.userId;
        }
    }

    const updated = await jobService.updateJob(request.params.id, updates);

    return {
        success: true,
        message: 'Job updated successfully',
        data: updated
    };
};

// DELETE /jobs/:id
exports.deleteJob = async (request, reply) => {
    const job = await jobService.getJobById(request.params.id);

    if (!job) {
        throw new ErrorResponse('Job not found', 404);
    }

    // Authorization: must be the user who created the job, or admin
    if (job.employerId && job.employerId.toString() !== request.user.id && request.user.role !== 'admin') {
        throw new ErrorResponse('Not authorized to delete this job', 403);
    }

    await jobService.deleteJob(request.params.id);

    return {
        success: true,
        message: 'Job deleted successfully',
        data: null
    };
};
