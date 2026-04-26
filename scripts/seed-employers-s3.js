const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// MongoDB Models (defined inline to avoid module path issues in standalone script)
const UserSchema = new mongoose.Schema({
    firstName: String, lastName: String, email: { type: String, unique: true }, phoneNumber: String, password: { type: String, select: false }, role: String, isActive: { type: Boolean, default: true }
}, { timestamps: true });

const EmployerSchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId, companyName: { type: String, unique: true }, logo: String, description: String, website: String, industry: String, companySize: String, location: { city: String, state: String, country: { type: String, default: 'India' } }, status: { type: String, default: 'Active' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const EmployerProfile = mongoose.model('EmployerProfile', EmployerSchema);

// Data for Seeding
const employersData = [
    {
        firstName: 'Kiran', lastName: 'Rao', email: 'kiran.rao@elitehomes.com', phone: '+919848012345',
        company: 'Elite Home Services Hyderabad', industry: 'Domestic Services', city: 'Hyderabad', state: 'Telangana',
        desc: 'Premium domestic staffing and home management solutions in the heart of Hyderabad.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\elite_home_logo_1777189666433.png'
    },
    {
        firstName: 'Prakash', lastName: 'Raj', email: 'prakash.raj@annapurna.com', phone: '+919988776655',
        company: 'Annapurna Heritage Vijayawada', industry: 'Hospitality', city: 'Vijayawada', state: 'Andhra Pradesh',
        desc: 'Authentic South Indian culinary experience serving the heritage of Andhra.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\annapurna_restaurant_logo_1777189741096.png'
    },
    {
        firstName: 'Lakshmi', lastName: 'Prasad', email: 'dr.lakshmi@sanjeevani.com', phone: '+919876543210',
        company: 'Sanjeevani Specialty Hospital Vizag', industry: 'Healthcare', city: 'Visakhapatnam', state: 'Andhra Pradesh',
        desc: 'State-of-the-art multi-specialty healthcare center providing world-class medical care.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\elite_home_logo_1777189666433.png'
    },
    {
        firstName: 'Venkatesh', lastName: 'Babu', email: 'venky@bharatforge.com', phone: '+919123456789',
        company: 'Bharat Manufacturing & Forge Pune', industry: 'Skilled Trades', city: 'Pune', state: 'Maharashtra',
        desc: 'Leading industrial manufacturing and heavy engineering works in Maharashtra.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\annapurna_restaurant_logo_1777189741096.png'
    },
    {
        firstName: 'Mahesh', lastName: 'Ghattamaneni', email: 'mahesh@deccaneng.com', phone: '+919888777666',
        company: 'Deccan Structural Engineering', industry: 'Engineering', city: 'Hyderabad', state: 'Telangana',
        desc: 'Expert structural design and civil engineering consultancy for mega projects.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\elite_home_logo_1777189666433.png'
    },
    {
        firstName: 'Satya', lastName: 'Narayana', email: 'satya@cyberinfotech.in', phone: '+919000111222',
        company: 'Cyberabad Tech Solutions', industry: 'Technology & IT', city: 'HITEC City', state: 'Telangana',
        desc: 'Innovation-driven IT services and software development hub in Hyderabad.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\annapurna_restaurant_logo_1777189741096.png'
    },
    {
        firstName: 'Vasundhara', lastName: 'Das', email: 'vasundhara@gurukul.edu', phone: '+918023456789',
        company: 'Gurukul Global Academy Bangalore', industry: 'Education', city: 'Bangalore', state: 'Karnataka',
        desc: 'Excellence in modern education blended with traditional values.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\elite_home_logo_1777189666433.png'
    },
    {
        firstName: 'Ram', lastName: 'Subramanian', email: 'ram@venkateshlaw.com', phone: '+914423456789',
        company: 'Venkatesh & Associates Law Firm', industry: 'Legal & Business', city: 'Chennai', state: 'Tamil Nadu',
        desc: 'Top-tier corporate legal consultancy and litigation services in South India.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\annapurna_restaurant_logo_1777189741096.png'
    },
    {
        firstName: 'Siddharth', lastName: 'Malhotra', email: 'sid@indoglobal.com', phone: '+912223456789',
        company: 'Indo-Global Marketing Group Mumbai', industry: 'Sales & Marketing', city: 'Mumbai', state: 'Maharashtra',
        desc: 'Full-service marketing and brand strategy agency based in the financial capital.', logoPath: 'C:\\Users\\deard\\.gemini\\antigravity\\brain\\59ad592d-0148-487b-be71-8330de39094a\\elite_home_logo_1777189666433.png'
    }
];

async function uploadToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const key = `companies_logo/${fileName}`;
    
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'image/png'
    }));

    // Construct the S3 URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        for (const data of employersData) {
            console.log(`Processing ${data.company}...`);

            // 1. Upload Logo
            const fileName = `${data.company.toLowerCase().replace(/ /g, '_')}.png`;
            const logoUrl = await uploadToS3(data.logoPath, fileName);
            console.log(`Uploaded logo: ${logoUrl}`);

            // 2. Create User
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phone,
                    password: hashedPassword,
                    role: 'employer'
                });
            }

            // 3. Create Employer Profile
            await EmployerProfile.findOneAndUpdate(
                { userId: user._id },
                {
                    companyName: data.company,
                    logo: logoUrl,
                    description: data.desc,
                    website: `https://www.${data.company.toLowerCase().replace(/ /g, '')}.com`,
                    industry: data.industry,
                    companySize: '51-200',
                    location: {
                        city: data.city,
                        state: data.state
                    },
                    status: 'Active'
                },
                { upsert: true, new: true }
            );

            console.log(`Seeded ${data.company} successfully.`);
        }

        console.log('All employers seeded successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
