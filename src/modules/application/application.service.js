const Application = require('./application.model');
const JobService = require('../job/job.service');
const ErrorResponse = require('../../utils/errorResponse');

class ApplicationService {
    async createApplication(jobId, jobseekerId, applicationData) {
        // Verify job exists
        await JobService.getJobById(jobId);

        // Check if user already applied (by email for this job)
        const { email } = applicationData;
        const existingApp = await Application.findOne({ jobId: jobId, email: email }).lean();
        
        if (existingApp) {
            // Self-healing: If user is logged in and it's their app, ensure it's linked to their profile
            if (jobseekerId && (!existingApp.jobseekerId || existingApp.jobseekerId.toString() === jobseekerId.toString())) {
                const jobseekerService = require('../jobseeker/jobseeker.service');
                await jobseekerService.addApplicationRecord(jobseekerId, existingApp._id);
                
                // If the application document didn't have the jobseekerId, update it now
                if (!existingApp.jobseekerId) {
                    await Application.findByIdAndUpdate(existingApp._id, { jobseekerId });
                }
            }
            throw new ErrorResponse('You have already applied for this job with this email', 400);
        }

        applicationData.jobId = jobId;
        applicationData.jobseekerId = jobseekerId || null;

        const application = await Application.create(applicationData);

        // Record the application in the jobseeker's profile if linked
        if (jobseekerId) {
            const jobseekerService = require('../jobseeker/jobseeker.service');
            await jobseekerService.addApplicationRecord(jobseekerId, application._id);
        }

        return application;
    }

    async getApplicationsForJob(jobId, employerId) {
        // Verify job ownership
        const job = await JobService.getJobById(jobId);
        if (job.employerId.toString() !== employerId.toString()) {
            throw new ErrorResponse('Not authorized to access these applications', 403);
        }

        // Return applicant info
        return await Application.find({ jobId })
            .populate('jobseekerId', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 })
            .lean();
    }

    async getMyApplications(jobseekerId) {
        return await Application.find({ jobseekerId })
            .populate('jobId', 'title company location type salary')
            .sort({ createdAt: -1 })
            .lean();
    }

    // ADMIN: Get all applications globally, or EMPLOYER: Get applications for their jobs
    async getAllApplications(queryOptions = {}) {
        const { limit = 100, skip = 0, status, employerId, jobId } = queryOptions;
        const filters = {};
        
        if (status) filters.status = status;
        if (jobId) filters.jobId = jobId;

        // If employerId is provided, filter by their jobs
        if (employerId) {
            const Job = require('../job/job.model');
            const employerJobs = await Job.find({ employerId }).select('_id');
            filters.jobId = { $in: employerJobs.map(j => j._id) };
        }

        const applications = await Application.find(filters)
            .populate('jobId', 'title company location type')
            .populate('jobseekerId', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();

        return applications;
    }

    // ADMIN / EMPLOYER: Update application status
    async updateApplicationStatus(id, updateData) {
        const allowedFields = ['status', 'coverLetter'];
        const filteredUpdate = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) filteredUpdate[field] = updateData[field];
        });

        const application = await Application.findByIdAndUpdate(id, filteredUpdate, {
            new: true,
            runValidators: true
        }).lean();

        if (!application) {
            throw new ErrorResponse('Application not found', 404);
        }
        return application;
    }

    // ADMIN: Delete application
    async deleteApplication(id) {
        const application = await Application.findByIdAndDelete(id);
        if (!application) {
            throw new ErrorResponse('Application not found', 404);
        }
        return application;
    }

    async withdrawApplication(id, jobseekerId) {
        const application = await Application.findById(id);
        if (!application) {
            throw new ErrorResponse('Application not found', 404);
        }

        // Verify ownership
        if (application.jobseekerId.toString() !== jobseekerId.toString()) {
            throw new ErrorResponse('Not authorized to withdraw this application', 403);
        }

        await Application.findByIdAndDelete(id);

        // Remove from profile
        const jobseekerService = require('../jobseeker/jobseeker.service');
        await jobseekerService.removeApplicationRecord(jobseekerId, id);

        return { success: true };
    }
}

module.exports = new ApplicationService();
