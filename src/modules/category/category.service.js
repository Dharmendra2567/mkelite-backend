const Category = require('./category.model');
const ErrorResponse = require('../../utils/errorResponse');

class CategoryService {
    async createCategory(categoryData) {
        // Basic validation for hierarchy
        if (categoryData.level !== 'industry' && !categoryData.parentId) {
            throw new ErrorResponse(`A parentId is required for level: ${categoryData.level}`, 400);
        }
        if (categoryData.level === 'industry') {
            categoryData.parentId = null; // Enforce null for top level
        }

        return await Category.create(categoryData);
    }

    async getCategories(queryOptions = {}) {
        const { limit = 50, skip = 0, sort = 'name', ...filters } = queryOptions;

        return await Category.find(filters)
            .populate('parentId', 'name level')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }

    async getCategoryTree() {
        // High performance aggregation to return the full 3-level tree natively structured
        return await Category.aggregate([
            { $match: { level: 'industry' } },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'departments',
                    pipeline: [
                        { $match: { level: 'department' } },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: '_id',
                                foreignField: 'parentId',
                                as: 'roles'
                            }
                        }
                    ]
                }
            }
        ]);
    }

    async getCategoryById(id) {
        const category = await Category.findById(id).populate('parentId', 'name level').lean();
        if (!category) {
            throw new ErrorResponse('Category not found', 404);
        }
        return category;
    }

    async updateCategory(id, updateData) {
        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).lean();

        if (!category) {
            throw new ErrorResponse('Category not found', 404);
        }
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findById(id).lean();
        if (!category) {
            throw new ErrorResponse('Category not found', 404);
        }

        let categoryIdsToDelete = [category._id];
        let jobQuery = {};

        // 1. Traverse Hierarchy downwards
        if (category.level === 'industry') {
            jobQuery.category = category.name;
            const departments = await Category.find({ parentId: category._id }).lean();
            const deptIds = departments.map(d => d._id);
            const roles = await Category.find({ parentId: { $in: deptIds } }).lean();
            categoryIdsToDelete.push(...deptIds, ...roles.map(r => r._id));

        } else if (category.level === 'department') {
            const industry = await Category.findById(category.parentId).lean();
            if (industry) jobQuery.category = industry.name;
            jobQuery.subCategory = category.name;

            const roles = await Category.find({ parentId: category._id }).lean();
            categoryIdsToDelete.push(...roles.map(r => r._id));

        } else if (category.level === 'role') {
            const department = await Category.findById(category.parentId).lean();
            if (department) {
                jobQuery.subCategory = department.name;
                const industry = await Category.findById(department.parentId).lean();
                if (industry) jobQuery.category = industry.name;
            }
            jobQuery.subSubCategory = category.name;
        }

        // 2. Clear related Jobs and their dependents
        const Job = require('../job/job.model');
        const jobsToDelete = await Job.find(jobQuery).select('_id').lean();
        const jobIds = jobsToDelete.map(j => j._id);

        if (jobIds.length > 0) {
            const Application = require('../application/application.model');
            const appsToDelete = await Application.find({ jobId: { $in: jobIds } }).select('_id').lean();
            const appIds = appsToDelete.map(a => a._id);

            // Cascade delete applications & references
            if (appIds.length > 0) {
                await Application.deleteMany({ _id: { $in: appIds } });
                const JobseekerProfile = require('../jobseeker/jobseeker.model');
                await JobseekerProfile.updateMany(
                    { 'applications.application': { $in: appIds } },
                    { $pull: { applications: { application: { $in: appIds } } } }
                );
            }

            // Cascade delete Orders
            const Order = require('../order/order.model');
            await Order.deleteMany({ jobId: { $in: jobIds } });

            // Cascade delete Jobseeker saved jobs
            const JobseekerProfile = require('../jobseeker/jobseeker.model');
            await JobseekerProfile.updateMany(
                { 'savedJobs.job': { $in: jobIds } },
                { $pull: { savedJobs: { job: { $in: jobIds } } } }
            );

            // Finally, delete the jobs
            await Job.deleteMany({ _id: { $in: jobIds } });
        }

        // 3. Delete the categories themselves
        await Category.deleteMany({ _id: { $in: categoryIdsToDelete } });

        return category;
    }
}

module.exports = new CategoryService();
