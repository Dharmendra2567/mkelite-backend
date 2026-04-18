const applicationService = require('./application.service');
const ErrorResponse = require('../../utils/errorResponse');

exports.createApplication = async (request, reply) => {
    // If logged in, only jobseekers can apply (employers/admins shouldn't)
    if (request.user && !['jobseeker', 'admin'].includes(request.user.role)) {
        reply.status(403).send({
            success: false,
            message: `Users with role ${request.user.role} cannot apply for jobs`,
            data: null
        });
        return;
    }

    const jobseekerId = request.user ? request.user.id : null;

    const application = await applicationService.createApplication(
        request.params.jobId,
        jobseekerId,
        request.body
    );

    reply.status(201).send({
        success: true,
        message: 'Application submitted successfully',
        data: application
    });
};

exports.getApplicationsForJob = async (request, reply) => {
    // Logic for authorization is handled in mapping or service but double check role here
    if (!['employer', 'admin'].includes(request.user.role)) {
        reply.status(403).send({
            success: false,
            message: 'Not authorized to view these applications',
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
    if (request.user.role !== 'jobseeker' && request.user.role !== 'admin') {
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
    const query = { ...request.query };
    
    // If employer, only show their own applications
    if (request.user.role === 'employer') {
        query.employerId = request.user.id;
    }

    const applications = await applicationService.getAllApplications(query);
    
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

exports.withdrawApplication = async (request, reply) => {
    const { id } = request.params;
    const jobseekerId = request.user.id;

    await applicationService.withdrawApplication(id, jobseekerId);

    return {
        success: true,
        message: 'Application withdrawn successfully',
        data: null
    };
};
