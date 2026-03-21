const applicationService = require('./application.service');
const ErrorResponse = require('../../utils/errorResponse');

exports.createApplication = async (request, reply) => {
    if (request.user.role !== 'jobseeker') {
        reply.status(403).send({
            success: false,
            message: 'Only jobseekers can apply for jobs',
            data: null
        });
        return;
    }

    const application = await applicationService.createApplication(
        request.params.jobId,
        request.user.id,
        request.body
    );

    reply.status(201).send({
        success: true,
        message: 'Application submitted successfully',
        data: application
    });
};

exports.getApplicationsForJob = async (request, reply) => {
    if (request.user.role !== 'employer') {
        reply.status(403).send({
            success: false,
            message: 'Only employers can view applications for a job',
            data: null
        });
        return;
    }

    const applications = await applicationService.getApplicationsForJob(request.params.jobId, request.user.id);

    return {
        success: true,
        message: `Successfully retrieved ${applications.length} applications for this job`,
        count: applications.length,
        data: applications
    };
};

exports.getMyApplications = async (request, reply) => {
    if (request.user.role !== 'jobseeker') {
        reply.status(403).send({
            success: false,
            message: 'Only jobseekers can view their applications',
            data: null
        });
        return;
    }

    const applications = await applicationService.getMyApplications(request.user.id);

    return {
        success: true,
        message: 'Successfully retrieved your applications',
        count: applications.length,
        data: applications
    };
};

// ADMIN: GET all applications across all jobs
exports.getAllApplications = async (request, reply) => {
    const applications = await applicationService.getAllApplications(request.query || {});
    return {
        success: true,
        message: `Successfully retrieved ${applications.length} applications`,
        count: applications.length,
        data: applications
    };
};

// ADMIN / EMPLOYER: Update application status
exports.updateApplicationStatus = async (request, reply) => {
    const application = await applicationService.updateApplicationStatus(
        request.params.id,
        request.body
    );
    return {
        success: true,
        message: 'Application updated successfully',
        data: application
    };
};

// ADMIN: Delete application
exports.deleteApplication = async (request, reply) => {
    await applicationService.deleteApplication(request.params.id);
    return {
        success: true,
        message: 'Application deleted successfully',
        data: null
    };
};
