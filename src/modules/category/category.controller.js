const categoryService = require('./category.service');

exports.createCategory = async (request, reply) => {
    const category = await categoryService.createCategory(request.body);
    reply.status(201).send({
        success: true,
        message: 'Category created successfully',
        data: category
    });
};

exports.getCategories = async (request, reply) => {
    const categories = await categoryService.getCategories(request.query);
    return {
        success: true,
        message: `Successfully retrieved ${categories.length} categories`,
        count: categories.length,
        data: categories
    };
};

exports.getCategoryTree = async (request, reply) => {
    const tree = await categoryService.getCategoryTree();
    return {
        success: true,
        message: 'Successfully retrieved category hierarchy tree',
        count: tree.length,
        data: tree
    };
};

exports.getCategoryById = async (request, reply) => {
    const category = await categoryService.getCategoryById(request.params.id);
    return {
        success: true,
        message: 'Category details retrieved successfully',
        data: category
    };
};

exports.updateCategory = async (request, reply) => {
    const category = await categoryService.updateCategory(request.params.id, request.body);
    return {
        success: true,
        message: 'Category updated successfully',
        data: category
    };
};

exports.deleteCategory = async (request, reply) => {
    await categoryService.deleteCategory(request.params.id);
    return {
        success: true,
        message: 'Category deleted successfully',
        data: null
    };
};
