const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

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

// MongoDB Model
const DynamicImage = mongoose.model('DynamicImage', new mongoose.Schema({
    tag: { type: String, unique: true },
    url: String,
    key: String,
    section: String,
    alt: String,
    title: String,
    active: { type: Boolean, default: true }
}, { timestamps: true }));

// 12 Partners mapped to 12 UNIQUE local icons
const partners = [
    { name: 'TCS', icon: 'it-contractor.svg' },
    { name: 'Infosys', icon: 'digital-creative.svg' },
    { name: 'Dr. Reddy', icon: 'graduate.svg' },
    { name: 'GMR Group', icon: 'manufacturing.svg' },
    { name: 'Cyient', icon: 'media-digital.svg' },
    { name: 'Bharat Biotech', icon: 'leisure-tourism.svg' },
    { name: 'Aurobindo', icon: 'marketing-pr.svg' },
    { name: 'My Home Group', icon: 'estate-agency.svg' },
    { name: 'Yashoda Hospitals', icon: 'legal.svg' },
    { name: 'Apollo Hospitals', icon: 'leisure-tourism-jobs.svg' },
    { name: 'Hetero Drugs', icon: 'motoring.svg' },
    { name: 'GVK', icon: 'marketing-pr-jobs.svg' },
];

async function uploadToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const key = `featured_companies_logo/${fileName}`;
    const contentType = fileName.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType
    }));

    return {
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key: key
    };
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const localIconsDir = path.join(__dirname, '../../job-portal/public/icons/categories');

        for (let i = 0; i < partners.length; i++) {
            const partner = partners[i];
            const tag = `partner_logo_${i + 1}`;
            const localPath = path.join(localIconsDir, partner.icon);

            console.log(`Uploading unique logo for ${partner.name}...`);
            
            if (!fs.existsSync(localPath)) {
                console.warn(`Local icon not found: ${localPath}. Using fallback.`);
                // Use a default if specific one missing
                const fallbackPath = path.join(localIconsDir, 'it-contractor.svg');
                const fileName = `${partner.name.toLowerCase().replace(/ /g, '_')}.svg`;
                const { url, key } = await uploadToS3(fallbackPath, fileName);
                
                await DynamicImage.findOneAndUpdate(
                    { tag },
                    { url, key, section: 'home', alt: `${partner.name} Logo`, title: partner.name, active: true },
                    { upsert: true }
                );
                continue;
            }

            const fileName = `${partner.name.toLowerCase().replace(/ /g, '_')}${path.extname(partner.icon)}`;
            const { url, key } = await uploadToS3(localPath, fileName);
            
            console.log(`Uploaded to S3: ${url}`);

            await DynamicImage.findOneAndUpdate(
                { tag },
                {
                    url,
                    key,
                    section: 'home',
                    alt: `${partner.name} Logo`,
                    title: partner.name,
                    active: true
                },
                { upsert: true, new: true }
            );
            console.log(`Updated DB for ${partner.name}`);
        }

        console.log('All 12 unique featured logos migrated to S3 successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
