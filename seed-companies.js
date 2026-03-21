const mongoose = require('mongoose');
const path = require('path');
const EmployerProfile = require('./src/modules/employer/employer.model');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const employerIds = [
    '69bda3a61cd77e9ebe4f2a15',
    '69bda36a1cd77e9ebe4f2a0d',
    '69bd4503f3e687115a2dfc5a'
];

const getRandomId = () => employerIds[Math.floor(Math.random() * employerIds.length)];

const companies = [
    {
        companyName: "Nexus Digital India",
        logo: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/logos/nexus-tech.png",
        coverImage: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/covers/tech-office.jpg",
        description: "Nexus Digital is a leading software development firm based in Bangalore, specializing in AI-driven solutions and cloud infrastructure for global enterprises.",
        website: "https://nexusdigital.in",
        industry: "Technology & IT",
        foundedYear: 2015,
        companySize: "201-500",
        location: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India",
            fullAddress: "Level 4, Prestige Tech Park, Marathahalli",
            pincode: "560103"
        },
        contactInfo: {
            email: "contact@nexusdigital.in",
            phone: "+91-8044221100",
            alternatePhone: "+91-9887766554"
        },
        hrDetails: {
            name: "Anjali Sharma",
            email: "anjali.hr@nexusdigital.in",
            phone: "+91-9988776655",
            designation: "Senior HR Manager"
        },
        socialLinks: {
            linkedin: "https://linkedin.com/company/nexus-digital-india",
            twitter: "https://twitter.com/nexus_india",
            instagram: "https://instagram.com/nexus_digital"
        },
        benefits: ["Remote Work", "Health Insurance", "Performance Bonus", "Learning Stipend"],
        tags: ["Innovation", "AI", "Startup Culture"],
        isVerified: true,
        legalInfo: {
            gstNumber: "29AAAAA0000A1Z5",
            cinNumber: "U72200KA2015PTC081234"
        }
    },
    {
        companyName: "Apollo Health Connect",
        logo: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/logos/apollo-health.png",
        coverImage: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/covers/hospital-lobby.jpg",
        description: "Apollo Health Connect is a digital healthcare arm focused on bridging the gap between patients and specialized medical care across India.",
        website: "https://apollohealth.co.in",
        industry: "Healthcare",
        foundedYear: 2012,
        companySize: "500+",
        location: {
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            fullAddress: "Apollo Health City, Jubilee Hills",
            pincode: "500033"
        },
        contactInfo: {
            email: "care@apollohealth.co.in",
            phone: "+91-4023607777"
        },
        hrDetails: {
            name: "Dr. Rajesh Kumar",
            email: "hr@apollohealth.co.in",
            phone: "+91-9122334455",
            designation: "Head of Talent Acquisition"
        },
        socialLinks: {
            linkedin: "https://linkedin.com/company/apollo-health-connect",
            facebook: "https://facebook.com/apollohealth"
        },
        benefits: ["Medical Cover", "Flexible Shifts", "Annual Checkups"],
        tags: ["Healthcare", "Patient Care", "Trusted"],
        isVerified: true
    },
    {
        companyName: "MaidEase Home Solutions",
        logo: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/logos/maidease.png",
        description: "MaidEase provides verified domestic help, including housemaids, cooks, and caregivers, ensuring safety and quality service for modern households.",
        website: "https://maidease.in",
        industry: "Domestic Services",
        foundedYear: 2019,
        companySize: "51-200",
        location: {
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            fullAddress: "Office 202, Amanora Chambers, Magarpatta City",
            pincode: "411028"
        },
        contactInfo: {
            email: "info@maidease.in",
            phone: "+91-2066778899"
        },
        hrDetails: {
            name: "Sandeep Patil",
            email: "sandeep@maidease.in",
            phone: "+91-8877665544",
            designation: "Operations Manager"
        },
        socialLinks: {
            instagram: "https://instagram.com/maidease_india"
        },
        benefits: ["Weekly Offs", "Insurance for Staff", "Training Programs"],
        tags: ["Verified", "Home Service", "Safety First"],
        isVerified: true
    },
    {
        companyName: "IndiStack Technologies",
        logo: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/logos/indistack.png",
        description: "IndiStack is a Gurugram-based fintech startup revolutionizing digital payments for small businesses in Tier 2 and Tier 3 cities.",
        website: "https://indistack.com",
        industry: "Technology & IT",
        foundedYear: 2021,
        companySize: "11-50",
        location: {
            city: "Gurgaon",
            state: "Haryana",
            country: "India",
            fullAddress: "Unitech Cyber Park, Sector 39",
            pincode: "122001"
        },
        contactInfo: {
            email: "hello@indistack.com",
            phone: "+91-1249988776"
        },
        hrDetails: {
            name: "Priya Das",
            email: "careers@indistack.com",
            phone: "+91-7766554433",
            designation: "Co-Founder & HR Head"
        },
        socialLinks: {
            linkedin: "https://linkedin.com/company/indistack",
            twitter: "https://twitter.com/indistack"
        },
        benefits: ["ESOPs", "Open Office", "Gaming Zone", "Unlimited Snacks"],
        tags: ["Fintech", "High Growth", "Young Team"],
        isVerified: false
    },
    {
        companyName: "Wellness India Clinics",
        logo: "https://mkelite-portal.s3.ap-south-2.amazonaws.com/logos/wellness-clinics.png",
        description: "Wellness India Clinics offers integrated health and wellness services, focusing on holistic healing and preventive medicine.",
        website: "https://wellnessindia.clinics",
        industry: "Healthcare",
        foundedYear: 2010,
        companySize: "201-500",
        location: {
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            fullAddress: "15th Floor, Maker Chambers VI, Nariman Point",
            pincode: "400021"
        },
        contactInfo: {
            email: "support@wellnessindia.clinics",
            phone: "+91-2244332211"
        },
        hrDetails: {
            name: "Vikram Mehta",
            email: "v.mehta@wellnessindia.clinics",
            phone: "+91-9001122334",
            designation: "HR Director"
        },
        benefits: ["Paid Sick Leave", "Family Health Plan", "Gym Membership"],
        tags: ["Wellness", "Holistic", "Experienced Team"],
        isVerified: true
    }
];

const seedCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding companies...');

        // Drop the stale unique index on userId if it exists
        try {
            await mongoose.connection.collection('employerprofiles').dropIndex('userId_1');
            console.log('Dropped stale userId unique index.');
        } catch (e) {
            console.log('No stale userId index to drop (or already dropped).');
        }

        for (let company of companies) {
            try {
                const existing = await EmployerProfile.findOne({ companyName: company.companyName });
                if (existing) {
                    console.log(`Company "${company.companyName}" already exists. Skipping.`);
                    continue;
                }

                const seedData = {
                    ...company,
                    userId: getRandomId(),
                    status: 'Active'
                };

                await EmployerProfile.create(seedData);
                console.log(`✅ Seeded: ${company.companyName}`);
            } catch (err) {
                console.error(`❌ Failed to seed "${company.companyName}":`, err.message);
            }
        }

        console.log('\nSeeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

seedCompanies();
