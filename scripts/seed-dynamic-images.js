const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Load env
dotenv.config();

const DynamicImage = require('../src/modules/image/image.model');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const PUBLIC_DIR = path.join(__dirname, '../../job-portal/public');

// Mock slugs to match frontend getImgIndex logic
const slugs = [
    'domestic-services',
    'hospitality',
    'healthcare',
    'skilled-trades',
    'engineering',
    'technology-it',
    'education',
    'legal-business',
    'sales-marketing'
];

const getImgIndex = (slug) => (slugs.indexOf(slug) % 8) + 1;

const imagesToSeed = [
    { tag: 'home_hero_bg', localPath: 'hero-man.png', section: 'home', alt: 'Hire & Get Hiring-Holder' },
    { tag: 'about_hero_bg', localPath: 'aboutus/certified_by_skill_development_center_of_india.jpg', section: 'about', alt: 'Certified by Skill Development Center of India' },
    { tag: 'about_founder', localPath: 'aboutus/founder_img.png', section: 'about', alt: 'M.K Naik - Founder' },
    { tag: 'about_statutory', localPath: 'aboutus/certified_by_skill_development_center_of_india.jpg', section: 'about', alt: 'Statutory Recognition' },
    { tag: 'about_billboard', localPath: 'aboutus/billboard_img.jpg', section: 'about', alt: 'All-in-One Staffing Solutions' },
    { tag: 'about_success_1', localPath: 'aboutus/image1.jpg', section: 'about', alt: 'Success Story 1' },
    { tag: 'about_success_2', localPath: 'aboutus/image2.jpg', section: 'about', alt: 'Success Story 2' },
    { tag: 'about_success_3', localPath: 'aboutus/image3.jpg', section: 'about', alt: 'Success Story 3' },
    { tag: 'about_success_4', localPath: 'aboutus/image4.jpg', section: 'about', alt: 'Success Story 4' },
    { tag: 'about_success_5', localPath: 'aboutus/image5.jpg', section: 'about', alt: 'Success Story 5' },
    { tag: 'about_success_6', localPath: 'aboutus/image6.jpg', section: 'about', alt: 'Success Story 6' },
];

// Add service images dynamically
slugs.forEach(slug => {
    const idx = getImgIndex(slug);
    imagesToSeed.push({ 
        tag: `service_hero_bg_${slug}`, 
        localPath: `aboutus/image${idx}.jpg`, 
        section: 'services', 
        alt: `${slug.replace('-', ' ')} Hero Background` 
    });
    imagesToSeed.push({ 
        tag: `service_img_${slug}`, 
        localPath: `aboutus/image${idx}.jpg`, 
        section: 'services', 
        alt: `${slug.replace('-', ' ')} Representative Image` 
    });
});

const seedImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        for (const img of imagesToSeed) {
            const fullPath = path.join(PUBLIC_DIR, img.localPath);
            
            if (!fs.existsSync(fullPath)) {
                console.warn(`File not found: ${fullPath}, skipping...`);
                continue;
            }

            const fileBuffer = fs.readFileSync(fullPath);
            const ext = path.extname(img.localPath);
            const fileName = `${img.tag}_${Date.now()}${ext}`;
            const s3Key = `images/${fileName}`;

            console.log(`Uploading ${img.tag} to S3...`);
            
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: getMimeType(ext)
            }));

            const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

            await DynamicImage.findOneAndUpdate(
                { tag: img.tag },
                {
                    tag: img.tag,
                    url: publicUrl,
                    key: s3Key,
                    section: img.section,
                    alt: img.alt,
                    active: true
                },
                { upsert: true, new: true }
            );

            console.log(`Successfully seeded ${img.tag} -> ${publicUrl}`);
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

function getMimeType(ext) {
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

seedImages();
