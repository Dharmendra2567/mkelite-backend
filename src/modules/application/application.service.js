const Application = require('./application.model');
const JobService = require('../job/job.service');
const ErrorResponse = require('../../utils/errorResponse');

class ApplicationService {
    async createApplication(jobId, jobseekerId, applicationData) {
        // Verify job exists
        await JobService.getJobById(jobId);

        // Check if user already applied
        const existingApp = await Application.findOne({ jobId, jobseekerId }).lean();
        if (existingApp) {
            throw new ErrorResponse('You have already applied for this job', 400);
        }

        applicationData.jobId = jobId;
        applicationData.jobseekerId = jobseekerId;

        const application = await Application.create(applicationData);
        return application;
    }

    async getApplicationsForJob(jobId, employerId) {
        // Verify job ownership
        const job = await JobService.getJobById(jobId);
        if (job.employerId.toString() !== employerId.toString()) {
            throw new ErrorResponse('Not authorized to access these applications', 403);
        }

        // Return robust profile info of applicants
        return await Application.find({ jobId }).populate('jobseekerId', 'name email').lean();
    }

    async getMyApplications(jobseekerId) {
        return await Application.find({ jobseekerId }).populate('jobId', 'title company location').lean();
    }

    // ADMIN: Get all applications globally, or EMPLOYER: Get applications for their jobs
    async getAllApplications(queryOptions = {}) {
        const { limit = 100, skip = 0, status, employerId } = queryOptions;
        const filters = {};
        if (status) filters.status = status;

        // If employerId is provided, we need to find all jobs by this employer first 
        // OR use a more complex aggregate/population filter.
        // For simplicity with existing structure:
        if (employerId) {
            const Job = require('../job/job.model');
            const employerJobs = await Job.find({ employerId }).select('_id');
            filters.jobId = { $in: employerJobs.map(j => j._id) };
        }

        return await Application.find(filters)
            .populate('jobId', 'title company location')
            .populate('jobseekerId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
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
}

module.exports = new ApplicationService();
