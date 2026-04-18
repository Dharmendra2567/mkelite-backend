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
const EmployerProfile = require('./src/modules/employer/employer.model');

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

// const hierarchy = [
//     {
//         industry: "Domestic Services",
//         icon: "domestic.png",
//         departments: [
//             {
//                 name: "Domestic & Household Services",
//                 roles: ["Home Maintenance", "House Maid", "Housekeeping Staff", "House Cook (In-House)", "Caregiving", "Baby Care (In-House / Up-Down)", "Patient Care (In-House / Up-Down)", "Japa Maid", "Elderly Caregiver"]
//             },
//             {
//                 name: "Security & Property",
//                 roles: ["Watchman", "Security Guard", "Caretaker"]
//             }
//         ]
//     },
//     {
//         industry: "Hospitality",
//         icon: "leisure-tourism.svg",
//         departments: [
//             {
//                 name: "Hospitality & Food Industry",
//                 roles: ["Waiter / Waitress", "Chef", "Kitchen Helper", "Cafe Staff", "Tea Point Staff"]
//             },
//             {
//                 name: "Hotels & Accommodation",
//                 roles: ["Hotel Staff", "Guest Room Staff", "Lodge Staff", "PG / Hostel Staff"]
//             },
//             {
//                 name: "Food Production",
//                 roles: ["Cloud Kitchen Staff", "Caterer Staff", "Food Court Staff"]
//             },
//             {
//                 name: "Events & Venues",
//                 roles: ["Event Staff", "Banquet Hall Staff", "Farmhouse Staff"]
//             }
//         ]
//     },
//     {
//         industry: "Healthcare",
//         icon: "graduate.svg",
//         departments: [
//             {
//                 name: "Healthcare & Medical",
//                 roles: ["MBBS Doctor", "Gynecologist", "Pediatrician", "Neurologist", "Cardiologist", "Ophthalmologist", "Dermatologist", "Anesthesiologist", "Psychiatrist", "Radiologist", "Pathologist", "Emergency Medicine Specialist", "Physiatrist", "Nurse", "Medical Assistant", "Lab Technician"]
//             }
//         ]
//     },
//     {
//         industry: "Skilled Trades",
//         icon: "manufacturing.svg",
//         departments: [
//             {
//                 name: "Skilled Trades & Technicians",
//                 roles: ["Carpenter", "Shuttering Carpenter", "Plumber", "Electrician", "Welder", "Mechanical Fitter", "Structural Fitter", "Maintenance Fitter", "Pipe Fitter", "ITI Fitter"]
//             }
//         ]
//     },
//     {
//         industry: "Engineering",
//         icon: "engineering.svg",
//         departments: [
//             {
//                 name: "Engineering & Technical",
//                 roles: ["Mechanical Engineer", "Production Engineer", "Maintenance Engineer", "Civil Engineer", "Site Engineer", "Construction Supervisor", "Electrical Engineer", "Electrical Technician", "Quality Control Engineer", "Plant Engineer"]
//             }
//         ]
//     },
//     {
//         industry: "Technology & IT",
//         icon: "it-contractor.svg",
//         departments: [
//             {
//                 name: "Technology & IT",
//                 roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer", "Network Engineer", "System Administrator", "IT Support Engineer", "Data Analyst", "Data Engineer"]
//             }
//         ]
//     },
//     {
//         industry: "Education",
//         icon: "graduate.svg",
//         departments: [
//             {
//                 name: "Education & Training",
//                 roles: ["School Teacher", "B.Ed Teacher", "D.Ed Teacher", "Junior College Lecturer", "Degree College Lecturer", "Guest Faculty", "Home Tutor", "Spoken English Trainer", "Education Counsellor", "Gym Trainer", "Yoga Trainer", "Chess Coach", "Swimming Coach", "Classical Dance Teacher", "Fashion Technology Faculty"]
//             }
//         ]
//     },
//     {
//         industry: "Legal & Business",
//         icon: "legal.svg",
//         departments: [
//             {
//                 name: "Legal & Business Services",
//                 roles: ["Company Registration", "NGO Registration", "LLP Registration", "Trade License", "Labour License", "Food License", "MSME Certificate", "Startup Certificate", "ISO Certificate", "Trademark Registration", "Trademark Renewal", "Chartered Accountant", "Accountant", "GST Filing Consultant", "ITR Filing Consultant", "Business Analyst (Hotel / Restaurant / Cafe)", "Site Selector"]
//             }
//         ]
//     },
//     {
//         industry: "Sales & Marketing",
//         icon: "marketing-pr.svg",
//         departments: [
//             {
//                 name: "Sales, Marketing & Creative",
//                 roles: ["Sales Executive", "Business Development Executive", "Digital Marketing Executive", "Marketing Executive", "Graphic Designer", "UI/UX Designer"]
//             }
//         ]
//     }
// ];
const dummyJobs = [

    /* ===================== DOMESTIC SERVICES ===================== */
    {
        jobId: "JOB001",
        title: "Live-in House Maid",
        company: "Elite Homes Hyderabad",
        companyLogo: "mkelite-icon.svg",

        location: {
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            fullAddress: "Banjara Hills, Hyderabad"
        },

        type: "Full-time",
        workMode: "On-site",

        salary: { min: 15000, max: 25000, currency: "INR", period: "Monthly" },

        overview: "Looking for a reliable live-in house maid for daily household activities.",

        description: "Responsible for maintaining cleanliness, cooking assistance, and general household tasks in a premium residence.",

        responsibilities: [
            "Clean and maintain the house",
            "Assist in cooking and kitchen work",
            "Laundry and ironing"
        ],

        requirements: [
            "1+ year experience",
            "Basic cooking skills",
            "Trustworthy and disciplined"
        ],

        benefits: ["Free accommodation", "Meals included"],

        experience: { min: 1, max: 3 },

        workDetails: {
            shift: "Day",
            workingDays: "6 days/week"
        },

        category: "Domestic Services",
        subCategory: "Domestic & Household Services",
        role: "House Maid",

        employerId: "69bd4503f3e687115a2dfc5a"
    },

    /* ⭐ DETAILED JOB */
    {
        jobId: "JOB002",
        title: "Security Guard",
        company: "SafeGuard Pvt Ltd",
        companyLogo: "security.png",

        location: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India",
            fullAddress: "Whitefield, Bangalore"
        },

        type: "Full-time",
        workMode: "On-site",

        salary: { min: 18000, max: 22000 },

        overview: "Hiring trained security personnel for residential and commercial properties.",

        description: "The selected candidate will be responsible for ensuring the safety and security of residents, visitors, and property assets. The role involves continuous monitoring of premises and strict adherence to security protocols. Candidates must be alert, disciplined, and capable of handling emergency situations effectively. This role requires working in rotational shifts including night duty. Prior experience in security services or defense background will be an added advantage.",

        responsibilities: [
            "Monitor and patrol assigned areas regularly to ensure safety and prevent unauthorized access",
            "Maintain visitor logs and verify identity before granting entry",
            "Respond quickly to alarms, emergencies, or suspicious activities",
            "Coordinate with management and local authorities when required",
            "Ensure proper functioning of CCTV systems and report any issues"
        ],

        requirements: [
            "Minimum 1–2 years of experience in security services or similar role",
            "Physically fit and capable of handling long working hours",
            "Basic communication skills in local language and Hindi/English",
            "Ability to stay alert and respond quickly in critical situations",
            "High level of discipline, integrity, and responsibility"
        ],

        benefits: [
            "Uniform provided by company",
            "PF & ESIC benefits",
            "Overtime pay as per company policy",
            "Accommodation support (if required)",
            "Weekly off rotation"
        ],

        category: "Domestic Services",
        subCategory: "Security & Property",
        role: "Security Guard",

        employerId: "69bda36a1cd77e9ebe4f2a0d"
    },

    {
        jobId: "JOB003",
        title: "Elderly Caregiver",
        company: "CarePlus Services",
        companyLogo: "care.png",

        location: {
            city: "Chennai",
            state: "Tamil Nadu",
            country: "India",
            fullAddress: "Anna Nagar, Chennai"
        },

        type: "Full-time",
        workMode: "On-site",

        salary: { min: 20000, max: 30000 },

        overview: "Looking for compassionate caregiver for elderly support.",

        description: "Assist elderly person with daily activities and ensure comfort.",

        responsibilities: [
            "Assist in daily routine",
            "Administer medicines",
            "Provide companionship"
        ],

        requirements: [
            "Caregiving experience",
            "Patience and empathy"
        ],

        benefits: ["Accommodation", "Meals"],

        category: "Domestic Services",
        subCategory: "Domestic & Household Services",
        role: "Elderly Caregiver",

        employerId: "69bda3a61cd77e9ebe4f2a15"
    },

    /* ===================== HOSPITALITY ===================== */

    {
        jobId: "JOB004",
        title: "Restaurant Waiter",
        company: "Spice Garden",
        companyLogo: "hotel.png",

        location: {
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            fullAddress: "Hitech City"
        },

        type: "Full-time",
        workMode: "On-site",

        salary: { min: 12000, max: 18000 },

        overview: "Hiring waiters for busy restaurant.",

        description: "Serve food, take orders and ensure customer satisfaction.",

        responsibilities: [
            "Take customer orders",
            "Serve food",
            "Maintain cleanliness"
        ],

        requirements: [
            "Good communication",
            "Customer handling skills"
        ],

        benefits: ["Tips", "Free meals"],

        category: "Hospitality",
        subCategory: "Hospitality & Food Industry",
        role: "Waiter / Waitress",

        employerId: "69bd4503f3e687115a2dfc5a"
    },

    /* ⭐ DETAILED JOB */
    {
        jobId: "JOB005",
        title: "Hotel Room Attendant",
        company: "Grand Stay Hotels",
        companyLogo: "hotel.png",

        location: {
            city: "Mumbai",
            state: "Maharashtra",
            country: "India"
        },

        type: "Full-time",
        workMode: "On-site",

        salary: { min: 14000, max: 20000 },

        overview: "Responsible for maintaining cleanliness and hygiene standards of guest rooms.",

        description: "The Hotel Room Attendant will ensure that all guest rooms and public areas are maintained to the highest cleanliness standards. The role involves cleaning, organizing, and replenishing room supplies as per hotel policies. Candidates must pay close attention to detail and follow hygiene protocols strictly. The job requires coordination with housekeeping supervisors and timely completion of assigned tasks. Previous hotel or housekeeping experience is preferred but not mandatory.",

        responsibilities: [
            "Clean and sanitize guest rooms, bathrooms, and common areas thoroughly",
            "Replace bed linens, towels, and toiletries as per hotel standards",
            "Report any maintenance issues or damages to the supervisor immediately",
            "Ensure proper use of cleaning equipment and chemicals",
            "Maintain inventory of housekeeping supplies and restock when needed"
        ],

        requirements: [
            "Basic understanding of housekeeping and cleaning procedures",
            "Ability to work in shifts including weekends and holidays",
            "Attention to detail and time management skills",
            "Physical stamina to perform cleaning tasks efficiently",
            "Positive attitude and willingness to learn"
        ],

        benefits: [
            "Free meals during shift",
            "Uniform provided",
            "Employee discounts on hotel services",
            "Career growth opportunities",
            "Paid leaves and weekly off"
        ],

        category: "Hospitality",
        subCategory: "Hotels & Accommodation",
        role: "Guest Room Staff",

        employerId: "69bda36a1cd77e9ebe4f2a0d"
    },

    {
        jobId: "JOB006",
        title: "Cloud Kitchen Staff",
        company: "QuickBite",
        companyLogo: "food.png",

        location: {
            city: "Delhi",
            state: "Delhi",
            country: "India"
        },

        type: "Full-time",

        salary: { min: 15000, max: 22000 },

        overview: "Work in fast-paced cloud kitchen.",

        description: "Prepare and pack food orders efficiently.",

        responsibilities: [
            "Food preparation",
            "Packaging",
            "Maintain hygiene"
        ],

        category: "Hospitality",
        subCategory: "Food Production",
        role: "Cloud Kitchen Staff",

        employerId: "69bda3a61cd77e9ebe4f2a15"
    },

    /* ===================== TECHNOLOGY ===================== */

    {
        jobId: "JOB007",
        title: "Frontend Developer",
        company: "TCS",
        companyLogo: "tcs.png",

        location: {
            city: "Mumbai",
            state: "Maharashtra",
            country: "India"
        },

        type: "Full-time",
        workMode: "Hybrid",

        salary: { min: 1200000, max: 2000000, period: "Yearly" },

        overview: "Build modern UI applications.",

        description: "Develop responsive web apps using React.",

        responsibilities: [
            "Develop UI",
            "Optimize performance",
            "Collaborate with backend team"
        ],

        requirements: [
            "React.js",
            "JavaScript",
            "CSS"
        ],

        benefits: ["Health insurance", "WFH options"],

        category: "Technology & IT",
        subCategory: "Technology & IT",
        role: "Frontend Developer",

        employerId: "69bd4503f3e687115a2dfc5a"
    },

    {
        jobId: "JOB008",
        title: "Backend Developer",
        company: "Infosys",
        companyLogo: "infosys.png",

        location: {
            city: "Pune",
            state: "Maharashtra",
            country: "India"
        },

        type: "Full-time",

        salary: { min: 1000000, max: 1800000, period: "Yearly" },

        overview: "Develop scalable backend systems.",

        description: "Work on APIs and databases.",

        responsibilities: [
            "Build REST APIs",
            "Database management",
            "Server optimization"
        ],

        requirements: ["Node.js", "MongoDB"],

        category: "Technology & IT",
        subCategory: "Technology & IT",
        role: "Backend Developer",

        employerId: "69bda36a1cd77e9ebe4f2a0d"
    },

    {
        jobId: "JOB009",
        title: "Data Analyst",
        company: "Wipro",
        companyLogo: "wipro.png",

        location: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India"
        },

        type: "Full-time",

        salary: { min: 800000, max: 1500000, period: "Yearly" },

        overview: "Analyze and interpret business data.",

        description: "Create dashboards and reports.",

        responsibilities: [
            "Data cleaning",
            "Reporting",
            "Insights generation"
        ],

        requirements: ["SQL", "Excel", "Power BI"],

        category: "Technology & IT",
        subCategory: "Technology & IT",
        role: "Data Analyst",

        employerId: "69bda3a61cd77e9ebe4f2a15"
    }

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

        // 3. Migrate Hierarchy (Skipped as per request)
        /*
        for (const item of hierarchy) {
            console.log(`Migrating Industry: ${item.industry}`);
            const iconUrl = await uploadToS3(path.join(PUBLIC_DIR, 'icons/categories', item.icon), 'categories');

            const industry = await Category.findOneAndUpdate(
                { name: item.industry, level: 'industry' },
                { icon: iconUrl, parentId: null },
                { upsert: true, returnDocument: 'after' }
            );

            for (const dept of item.departments) {
                console.log(`  -> Department: ${dept.name}`);
                const department = await Category.findOneAndUpdate(
                    { name: dept.name, level: 'department', parentId: industry._id },
                    {},
                    { upsert: true, returnDocument: 'after' }
                );

                for (const roleName of dept.roles) {
                    await Category.findOneAndUpdate(
                        { name: roleName, level: 'role', parentId: department._id },
                        {},
                        { upsert: true, returnDocument: 'after' }
                    );
                }
            }
        }
        */

        // 4. Migrate Jobs
        for (const jobData of dummyJobs) {
            console.log(`Migrating Job: ${jobData.title} (${jobData.jobId})`);
            
            let logoUrl = '';
            if (jobData.companyLogo) {
                // Ignore upload failure silently so migration continues
                const uploaded = await uploadToS3(path.join(PUBLIC_DIR, 'logos', jobData.companyLogo), 'logos');
                if (uploaded) logoUrl = uploaded;
            }

            // Exclude employerId if we want to use the one from config, or use the one from jobData if it exists
            const finalEmployerId = jobData.employerId || employer._id;

            // 1. Ensure Employer Profile Exists (since 'company' string isn't allowed in Job Schema)
            const employerProfile = await EmployerProfile.findOneAndUpdate(
                { companyName: jobData.company },
                {
                    userId: finalEmployerId,
                    companyName: jobData.company,
                    logo: logoUrl || jobData.companyLogo || 'default-company-logo.png',
                    description: `Official profile for ${jobData.company}`,
                    industry: jobData.category || 'Other',
                    location: jobData.location || { city: 'Bengaluru' }
                },
                { upsert: true, returnDocument: 'after' }
            );

            // 2. Extract out invalid Schema fields from jobData
            const { company, companyLogo, role, ...validJobData } = jobData;

            // 3. Save the actual Job
            await Job.findOneAndUpdate(
                { jobId: jobData.jobId },
                {
                    ...validJobData,
                    employerProfileId: employerProfile._id,
                    employerId: finalEmployerId,
                    subSubCategory: role, // Remap the 'role' to 'subSubCategory' as configured in model
                    type: jobData.type || 'Full-time' 
                },
                { upsert: true, returnDocument: 'after' }
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
