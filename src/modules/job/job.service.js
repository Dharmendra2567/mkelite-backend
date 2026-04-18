const mongoose = require('mongoose');
const Job = require('./job.model');
const ErrorResponse = require('../../utils/errorResponse');

class JobService {
    async createJob(jobData, userId) {
        // Track who posted the job (the user)
        jobData.employerId = userId;

        // Generate a unique 5-digit jobId
        let isUnique = false;
        let shortId;
        while (!isUnique) {
            shortId = Math.floor(10000 + Math.random() * 90000).toString();
            const existing = await Job.findOne({ jobId: shortId });
            if (!existing) isUnique = true;
        }
        jobData.jobId = shortId;

        const job = await Job.create(jobData);
        return job;
    }

    _buildQuery(queryOptions) {
        const { limit, skip, sort, keywords, category, subCategory, type, workMode, isFeatured, employerId, employerProfileId } = queryOptions;
        const mongoQuery = {};

        if (keywords) {
            mongoQuery.$or = [
                { title: { $regex: keywords, $options: 'i' } },
                { description: { $regex: keywords, $options: 'i' } },
                { category: { $regex: keywords, $options: 'i' } },
                { subCategory: { $regex: keywords, $options: 'i' } }
            ];
        }
        if (category) mongoQuery.category = { $regex: category, $options: 'i' };
        if (subCategory) mongoQuery.subCategory = { $regex: subCategory, $options: 'i' };
        if (type) mongoQuery.type = type;
        if (workMode) mongoQuery.workMode = workMode;
        if (isFeatured !== undefined) mongoQuery.isFeatured = isFeatured === 'true';
        if (employerId) mongoQuery.employerId = employerId;
        if (employerProfileId) mongoQuery.employerProfileId = employerProfileId;

        return mongoQuery;
    }

    async getJobs(queryOptions = {}) {
        const { limit = 20, skip = 0, sort = '-createdAt' } = queryOptions;
        const mongoQuery = this._buildQuery(queryOptions);

        let jobQuery = Job.find(mongoQuery)
            .populate('employerProfileId', 'companyName logo location industry companySize')
            .lean();

        if (sort) jobQuery = jobQuery.sort(sort);
        if (skip) jobQuery = jobQuery.skip(Number(skip));
        if (limit) jobQuery = jobQuery.limit(Number(limit));

        const jobs = await jobQuery;

        // Lazy migration for jobId for returned results
        for (let job of jobs) {
            if (!job.jobId) {
                let isUnique = false;
                let shortId;
                while (!isUnique) {
                    shortId = Math.floor(10000 + Math.random() * 90000).toString();
                    const existing = await Job.findOne({ jobId: shortId });
                    if (!existing) isUnique = true;
                }
                await Job.findByIdAndUpdate(job._id, { jobId: shortId });
                job.jobId = shortId;
            }
        }

        return jobs;
    }

    async getJobById(id, userId = null) {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            query.jobId = id;
        }

        let job = await Job.findOne(query)
            .populate('employerProfileId', 'companyName logo coverImage location industry companySize website contactInfo hrDetails socialLinks benefits tags')
            .populate('employerId', 'firstName lastName email')
            .lean();

        // Check if user already applied
        if (job && userId) {
            const Application = require('../application/application.model');
            const application = await Application.findOne({ 
                jobId: job._id, 
                jobseekerId: userId 
            }).select('_id status').lean();
            
            job.isApplied = !!application;
            if (application) {
                job.applicationStatus = application.status;
                job.applicationId = application._id;
            }
        }

        // Lazy Migration if jobId is missing
        if (job && !job.jobId) {
            let isUnique = false;
            let shortId;
            while (!isUnique) {
                shortId = Math.floor(10000 + Math.random() * 90000).toString();
                const existing = await Job.findOne({ jobId: shortId });
                if (!existing) isUnique = true;
            }
            await Job.findByIdAndUpdate(job._id, { jobId: shortId });
            job.jobId = shortId;
        }

        if (!job) {
            throw new ErrorResponse(`Job not found with id of ${id}`, 404);
        }
        return job;
    }

    async countJobs(queryOptions = {}) {
        const mongoQuery = this._buildQuery(queryOptions);
        return await Job.countDocuments(mongoQuery);
    }

    async updateJob(id, updates) {
        return await Job.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).lean();
    }

    async deleteJob(id) {
        return await Job.findByIdAndDelete(id);
    }
}

module.exports = new JobService();
