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
const Category = mongoose.model('Category', new mongoose.Schema({
    name: String,
    level: String,
    icon: String
}));

const categoryIconMap = {
    'Domestic Services': 'domestic.png',
    'Hospitality': 'leisure-tourism.svg',
    'Healthcare': 'graduate.svg',
    'Skilled Trades': 'manufacturing.svg',
    'Engineering': 'digital-creative.svg',
    'Technology & IT': 'it-contractor.svg',
    'Education': 'graduate.svg',
    'Legal & Business': 'legal.svg',
    'Sales & Marketing': 'marketing-pr.svg'
};

async function uploadToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const key = `categories_logo/${fileName}`;
    const contentType = fileName.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType
    }));

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const iconsBaseDir = path.join(__dirname, '../../job-portal/public/icons/categories');

        for (const [catName, fileName] of Object.entries(categoryIconMap)) {
            console.log(`Processing category: ${catName}...`);
            
            const localPath = path.join(iconsBaseDir, fileName);
            if (!fs.existsSync(localPath)) {
                console.warn(`File not found: ${localPath}`);
                continue;
            }

            // 1. Upload to S3
            const s3Url = await uploadToS3(localPath, fileName);
            console.log(`Uploaded to S3: ${s3Url}`);

            // 2. Update Database
            const result = await Category.findOneAndUpdate(
                { name: catName, level: 'industry' },
                { icon: s3Url },
                { new: true }
            );

            if (result) {
                console.log(`Updated database for ${catName}`);
            } else {
                console.warn(`Category not found in DB: ${catName}`);
            }
        }

        console.log('Category icons migrated to S3 successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
