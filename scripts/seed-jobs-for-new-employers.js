const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB Models
const JobSchema = new mongoose.Schema({
    jobId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    employerProfileId: { type: mongoose.Schema.ObjectId, ref: 'EmployerProfile' },
    location: { city: String, state: String, country: String, fullAddress: String },
    type: { type: String, required: true },
    workMode: { type: String },
    salary: { min: Number, max: Number, currency: { type: String, default: 'INR' }, period: { type: String, default: 'Monthly' } },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    subSubCategory: { type: String, required: true },
    employerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

const EmployerProfile = mongoose.model('EmployerProfile', new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    companyName: String,
    logo: String,
    industry: String,
    location: { city: String, state: String }
}));

const jobsByIndustry = {
    'Domestic Services': [
        { title: 'Full-time Housekeeper', subCat: 'Cleaning', subSubCat: 'Residential', type: 'Full-time', desc: 'Seeking an experienced housekeeper for a large residential property in Hyderabad. Must be reliable and have prior experience in luxury home management.' },
        { title: 'Professional Nanny', subCat: 'Childcare', subSubCat: 'Private Home', type: 'Full-time', desc: 'Looking for a caring and certified nanny to look after two children. Background in early childhood education preferred.' }
    ],
    'Hospitality': [
        { title: 'South Indian Head Chef', subCat: 'Culinary', subSubCat: 'Traditional Cuisine', type: 'Full-time', desc: 'Join our heritage restaurant as a Head Chef. Must specialize in authentic Andhra and South Indian delicacies.' },
        { title: 'Restaurant Operations Manager', subCat: 'Management', subSubCat: 'F&B', type: 'Full-time', desc: 'Oversee daily operations, staff management, and guest relations for our premium heritage restaurant.' }
    ],
    'Healthcare': [
        { title: 'Senior Staff Nurse (ICU)', subCat: 'Nursing', subSubCat: 'Critical Care', type: 'Full-time', desc: 'We are looking for a dedicated ICU nurse with 3+ years of experience in specialty hospitals.' },
        { title: 'Medical Front Office Executive', subCat: 'Administration', subSubCat: 'Reception', type: 'Full-time', desc: 'Manage patient appointments, front desk operations, and insurance coordination.' }
    ],
    'Skilled Trades': [
        { title: 'CNC Machine Operator', subCat: 'Manufacturing', subSubCat: 'Machining', type: 'Full-time', desc: 'Operate and maintain CNC machines in our Pune forge unit. 2+ years of industrial experience required.' },
        { title: 'Quality Control Inspector', subCat: 'Quality', subSubCat: 'Industrial', type: 'Full-time', desc: 'Perform rigorous quality checks on manufactured components to meet international standards.' }
    ],
    'Engineering': [
        { title: 'Structural CAD Draftsman', subCat: 'Design', subSubCat: 'Structural', type: 'Full-time', desc: 'Proficient in AutoCAD and Revit for creating detailed structural engineering drawings.' },
        { title: 'Civil Site Engineer', subCat: 'Construction', subSubCat: 'On-site', type: 'Full-time', desc: 'Supervise on-site construction activities and ensure compliance with structural designs and safety norms.' }
    ],
    'Technology & IT': [
        { title: 'Senior React Developer', subCat: 'Software Development', subSubCat: 'Frontend', type: 'Full-time', desc: 'Build modern, responsive web applications using React, Next.js, and Tailwind CSS.' },
        { title: 'Full-Stack Node.js Engineer', subCat: 'Software Development', subSubCat: 'Backend', type: 'Full-time', desc: 'Design and implement scalable backend services and RESTful APIs using Node.js and MongoDB.' }
    ],
    'Education': [
        { title: 'Primary English Teacher', subCat: 'Teaching', subSubCat: 'Primary School', type: 'Full-time', desc: 'Inspire young minds through creative English language teaching methodologies.' },
        { title: 'Academic Coordinator', subCat: 'Administration', subSubCat: 'Academic Planning', type: 'Full-time', desc: 'Manage curriculum planning, teacher schedules, and academic quality assurance.' }
    ],
    'Legal & Business': [
        { title: 'Corporate Legal Assistant', subCat: 'Legal Support', subSubCat: 'Corporate Law', type: 'Full-time', desc: 'Assist in drafting legal documents, contracts, and conducting legal research for corporate clients.' },
        { title: 'Junior Litigation Advocate', subCat: 'Legal Practice', subSubCat: 'Litigation', type: 'Full-time', desc: 'Represent clients in various courts and assist senior advocates in trial preparation.' }
    ],
    'Sales & Marketing': [
        { title: 'Digital Marketing Specialist', subCat: 'Marketing', subSubCat: 'Digital', type: 'Full-time', desc: 'Drive brand growth through SEO, SEM, and social media marketing strategies.' },
        { title: 'Strategic Account Manager', subCat: 'Sales', subSubCat: 'B2B', type: 'Full-time', desc: 'Develop and maintain long-term relationships with key accounts and drive business expansion.' }
    ]
};

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const employers = await EmployerProfile.find();
        console.log(`Found ${employers.length} employers to seed jobs for.`);

        for (const emp of employers) {
            const industry = emp.industry;
            const jobTemplates = jobsByIndustry[industry] || [];

            console.log(`Seeding 2 jobs for ${emp.companyName} (${industry})...`);

            for (const template of jobTemplates) {
                // Generate a unique 5-digit jobId
                let isUnique = false;
                let shortId;
                while (!isUnique) {
                    shortId = Math.floor(10000 + Math.random() * 90000).toString();
                    const existing = await Job.findOne({ jobId: shortId });
                    if (!existing) isUnique = true;
                }

                await Job.create({
                    jobId: shortId,
                    title: template.title,
                    employerProfileId: emp._id,
                    employerId: emp.userId,
                    location: {
                        city: emp.location.city,
                        state: emp.location.state,
                        country: 'India',
                        fullAddress: `${emp.location.city}, ${emp.location.state}, India`
                    },
                    type: template.type,
                    workMode: 'On-site',
                    salary: {
                        min: Math.floor(15000 + Math.random() * 10000),
                        max: Math.floor(30000 + Math.random() * 20000),
                        currency: 'INR',
                        period: 'Monthly'
                    },
                    description: template.desc,
                    category: industry,
                    subCategory: template.subCat,
                    subSubCategory: template.subSubCat,
                    status: 'Active'
                });
            }

            console.log(`Successfully seeded jobs for ${emp.companyName}.`);
        }

        console.log('Total 18 jobs seeded successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
