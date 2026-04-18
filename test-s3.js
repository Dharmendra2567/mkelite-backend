const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function test() {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const key = 'resume/test-upload.txt';
    const body = 'Testing S3 upload from backend';

    console.log(`Testing S3 Upload to Bucket: ${bucketName}, Key: ${key}, Region: ${process.env.AWS_REGION}`);
    
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: 'text/plain',
        });
        const result = await s3Client.send(command);
        console.log('Upload Succeeded:', result);
    } catch (err) {
        console.error('Upload Failed:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

test();
