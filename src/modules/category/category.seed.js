const Category = require('./category.model');

const seedCategories = async () => {
    // Check if categories already exist
    const count = await Category.countDocuments();
    if (count > 0) return;

    console.log('Seeding Categories...');

    const techIndustry = await Category.create({
        name: 'Technology & IT',
        level: 'industry',
        icon: 'tech-icon'
    });

    const softwareDept = await Category.create({
        name: 'Software Development',
        level: 'department',
        parentId: techIndustry._id
    });

    await Category.insertMany([
        { name: 'Frontend Developer', level: 'role', parentId: softwareDept._id },
        { name: 'Backend Developer', level: 'role', parentId: softwareDept._id },
        { name: 'Full-Stack Developer', level: 'role', parentId: softwareDept._id },
        { name: 'Mobile App Developer', level: 'role', parentId: softwareDept._id }
    ]);

    const itInfraDept = await Category.create({
        name: 'IT Infrastructure',
        level: 'department',
        parentId: techIndustry._id
    });

    await Category.insertMany([
        { name: 'System Administrator', level: 'role', parentId: itInfraDept._id },
        { name: 'Network Engineer', level: 'role', parentId: itInfraDept._id },
        { name: 'IT Support Engineer', level: 'role', parentId: itInfraDept._id }
    ]);

    const dataDept = await Category.create({
        name: 'Data & Analytics',
        level: 'department',
        parentId: techIndustry._id
    });

    await Category.insertMany([
        { name: 'Data Analyst', level: 'role', parentId: dataDept._id },
        { name: 'Data Engineer', level: 'role', parentId: dataDept._id }
    ]);

    console.log('Categories seeded successfully.');
};

module.exports = seedCategories;
