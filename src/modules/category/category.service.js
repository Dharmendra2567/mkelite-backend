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
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new ErrorResponse('Category not found', 404);
        }

        // Cascade delete children logically (departments or roles tied to this ID)
        await Category.deleteMany({ parentId: id });

        return category;
    }
}

module.exports = new CategoryService();
