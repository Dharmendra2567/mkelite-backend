const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config({ path: path.join(__dirname, '.env') });

// Models
const Category = require('./src/modules/category/category.model');
const Job = require('./src/modules/job/job.model');
const User = require('./src/modules/user/user.model');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const PUBLIC_DIR = path.join(__dirname, '../job-portal/public');

async function uploadToS3(filePath, keyPrefix = 'assets') {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }

    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const key = `${keyPrefix}/${Date.now()}-${fileName}`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: fileName.endsWith('.svg') ? 'image/svg+xml' : (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg')
        }));
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (err) {
        console.error(`S3 Upload failed for ${fileName}:`, err);
        return null;
    }
}

const hierarchy = [
    {
        industry: "Domestic Services",
        icon: "domestic.png",
        departments: [
            {
                name: "Domestic & Household Services",
                roles: ["Home Maintenance", "House Maid", "Housekeeping Staff", "House Cook (In-House)", "Caregiving", "Baby Care (In-House / Up-Down)", "Patient Care (In-House / Up-Down)", "Japa Maid", "Elderly Caregiver"]
            },
            {
                name: "Security & Property",
                roles: ["Watchman", "Security Guard", "Caretaker"]
            }
        ]
    },
    {
        industry: "Hospitality",
        icon: "leisure-tourism.svg",
        departments: [
            {
                name: "Hospitality & Food Industry",
                roles: ["Waiter / Waitress", "Chef", "Kitchen Helper", "Cafe Staff", "Tea Point Staff"]
            },
            {
                name: "Hotels & Accommodation",
                roles: ["Hotel Staff", "Guest Room Staff", "Lodge Staff", "PG / Hostel Staff"]
            },
            {
                name: "Food Production",
                roles: ["Cloud Kitchen Staff", "Caterer Staff", "Food Court Staff"]
            },
            {
                name: "Events & Venues",
                roles: ["Event Staff", "Banquet Hall Staff", "Farmhouse Staff"]
            }
        ]
    },
    {
        industry: "Healthcare",
        icon: "graduate.svg",
        departments: [
            {
                name: "Healthcare & Medical",
                roles: ["MBBS Doctor", "Gynecologist", "Pediatrician", "Neurologist", "Cardiologist", "Ophthalmologist", "Dermatologist", "Anesthesiologist", "Psychiatrist", "Radiologist", "Pathologist", "Emergency Medicine Specialist", "Physiatrist", "Nurse", "Medical Assistant", "Lab Technician"]
            }
        ]
    },
    {
        industry: "Skilled Trades",
        icon: "manufacturing.svg",
        departments: [
            {
                name: "Skilled Trades & Technicians",
                roles: ["Carpenter", "Shuttering Carpenter", "Plumber", "Electrician", "Welder", "Mechanical Fitter", "Structural Fitter", "Maintenance Fitter", "Pipe Fitter", "ITI Fitter"]
            }
        ]
    },
    {
        industry: "Engineering",
        icon: "engineering.svg",
        departments: [
            {
                name: "Engineering & Technical",
                roles: ["Mechanical Engineer", "Production Engineer", "Maintenance Engineer", "Civil Engineer", "Site Engineer", "Construction Supervisor", "Electrical Engineer", "Electrical Technician", "Quality Control Engineer", "Plant Engineer"]
            }
        ]
    },
    {
        industry: "Technology & IT",
        icon: "it-contractor.svg",
        departments: [
            {
                name: "Technology & IT",
                roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", "Network Engineer", "System Administrator", "IT Support Engineer", "Data Analyst", "Data Engineer"]
            }
        ]
    },
    {
        industry: "Education",
        icon: "graduate.svg",
        departments: [
            {
                name: "Education & Training",
                roles: ["School Teacher", "B.Ed Teacher", "D.Ed Teacher", "Junior College Lecturer", "Degree College Lecturer", "Guest Faculty", "Home Tutor", "Spoken English Trainer", "Education Counsellor", "Gym Trainer", "Yoga Trainer", "Chess Coach", "Swimming Coach", "Classical Dance Teacher", "Fashion Technology Faculty"]
            }
        ]
    },
    {
        industry: "Legal & Business",
        icon: "legal.svg",
        departments: [
            {
                name: "Legal & Business Services",
                roles: ["Company Registration", "NGO Registration", "LLP Registration", "Trade License", "Labour License", "Food License", "MSME Certificate", "Startup Certificate", "ISO Certificate", "Trademark Registration", "Trademark Renewal", "Chartered Accountant", "Accountant", "GST Filing Consultant", "ITR Filing Consultant", "Business Analyst (Hotel / Restaurant / Cafe)", "Site Selector"]
            }
        ]
    },
    {
        industry: "Sales & Marketing",
        icon: "marketing-pr.svg",
        departments: [
            {
                name: "Sales, Marketing & Creative",
                roles: ["Sales Executive", "Business Development Executive", "Digital Marketing Executive", "Marketing Executive", "Graphic Designer", "UI/UX Designer"]
            }
        ]
    }
];

const dummyJobs = [
    { title: 'Full-time Housekeeper', company: 'Elite Homes Hyderabad', location: 'Banjara Hills, Hyderabad', salary: '₹15,000 - ₹25,000 Monthly', type: 'Full-time', experience: '2+ years', category: 'Domestic Services', subCategory: 'Housekeeping Staff', logo: 'mkelite-icon.svg', description: 'Experienced housekeeper needed for a high-end family home.' },
    { title: 'South Indian Cook', company: 'Mysore Flavors', location: 'Indiranagar, Bangalore', salary: '₹20,000 - ₹35,000 Monthly', type: 'Full-time', experience: '5+ years', category: 'Domestic Services', subCategory: 'House Cook (In-House)', logo: 'mkelite-icon.svg', description: 'Expert in authentic South Indian cuisine requested.' },
    { title: 'Lead Frontend Developer', company: 'TCS', location: 'Thane, Mumbai', salary: '₹12,00,000 - ₹20,00,000 PA', type: 'Full-time', experience: '6+ years', category: 'Technology & IT', subCategory: 'Frontend Developer', logo: 'tcs.png', description: 'Join India\'s leading IT services company.' },
    { title: 'Cloud Infrastructure Engineer', company: 'Microsoft', location: 'Gachibowli, Hyderabad', salary: '₹18,00,000 - ₹30,00,000 PA', type: 'Full-time', experience: '5+ years', category: 'Technology & IT', subCategory: 'Network Engineer', logo: 'microsoft.png', description: 'Work at Microsoft\'s largest development center.' },
    { title: 'Senior Product Designer', company: 'Google', location: 'Aerocity, New Delhi', salary: '₹25,00,000 - ₹45,00,000 PA', type: 'Full-time', experience: '5+ years', category: 'Sales & Marketing', subCategory: 'UI/UX Designer', logo: 'google.png', description: 'Design the future of Search and Android.' },
    { title: 'Head Chef (Italian)', company: 'Little Italy', location: 'Jubilee Hills, Hyderabad', salary: '₹40,00,000 - ₹60,00,000 PA', type: 'Full-time', experience: '10+ years', category: 'Hospitality', subCategory: 'Chef', logo: 'zomato.png', description: 'We are looking for an experienced Italian chef.' },
    { title: 'Network Security Specialist', company: 'Wipro', location: 'Pune', salary: '₹10,00,000 - ₹18,00,000 PA', type: 'Full-time', experience: '4+ years', category: 'Technology & IT', subCategory: 'Network Engineer', logo: 'wipro.png', description: 'Security focus for enterprise clients.' }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find an employer
        let employer = await User.findOne({ role: 'employer' });
        if (!employer) {
            console.log('No employer found, searching for admin...');
            employer = await User.findOne({ role: 'admin' });
        }
        if (!employer) throw new Error('No employer or admin user found to assign jobs');

        console.log(`Using user ${employer.email} as job owner`);

        // 2. Clear existing (Optional - but safer for clean migration)
        // await Category.deleteMany({});
        // await Job.deleteMany({});

        // 3. Migrate Hierarchy
        for (const item of hierarchy) {
            console.log(`Migrating Industry: ${item.industry}`);
            const iconUrl = await uploadToS3(path.join(PUBLIC_DIR, 'icons/categories', item.icon), 'categories');

            const industry = await Category.findOneAndUpdate(
                { name: item.industry, level: 'industry' },
                { icon: iconUrl, parentId: null },
                { upsert: true, new: true }
            );

            for (const dept of item.departments) {
                console.log(`  -> Department: ${dept.name}`);
                const department = await Category.findOneAndUpdate(
                    { name: dept.name, level: 'department', parentId: industry._id },
                    {},
                    { upsert: true, new: true }
                );

                for (const roleName of dept.roles) {
                    await Category.findOneAndUpdate(
                        { name: roleName, level: 'role', parentId: department._id },
                        {},
                        { upsert: true, new: true }
                    );
                }
            }
        }

        // 4. Migrate Jobs
        for (const jobData of dummyJobs) {
            console.log(`Migrating Job: ${jobData.title}`);
            const logoUrl = await uploadToS3(path.join(PUBLIC_DIR, 'logos', jobData.logo), 'logos');

            await Job.findOneAndUpdate(
                { title: jobData.title, company: jobData.company },
                {
                    ...jobData,
                    companyLogo: logoUrl,
                    employerId: employer._id,
                    type: jobData.type // ensure it matches enum
                },
                { upsert: true, new: true }
            );
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
