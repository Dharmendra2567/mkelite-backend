const { PutObjectCommand, s3Client } = require('../../utils/s3');
const ErrorResponse = require('../../utils/errorResponse');
const crypto = require('crypto');
const path = require('path');

exports.uploadFile = async (request, reply) => {
    const data = await request.file();
    if (!data) {
        throw new ErrorResponse('No file uploaded', 400);
    }

    // Validation
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', // Logos/Icons
        'application/pdf', // Resumes
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
    ];

    if (!allowedMimeTypes.includes(data.mimetype)) {
        throw new ErrorResponse(`File type ${data.mimetype} not allowed`, 400);
    }

    const fileBuffer = await data.toBuffer();
    if (fileBuffer.length > 5 * 1024 * 1024) { // 5MB limit
        throw new ErrorResponse('File size exceeds 5MB limit', 400);
    }

    // Generate unique name
    const ext = path.extname(data.filename);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const bucketName = process.env.AWS_BUCKET_NAME;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: data.mimetype,
        // ACL: 'public-read', // Uncomment if bucket allows public-read ACL
    };

    try {
        await s3Client.send(new PutObjectCommand(params));

        // Construct public URL (Assuming bucket is public or using CloudFront)
        // Adjust this based on S3 bucket configuration (e.g., https://bucket.s3.region.amazonaws.com/key)
        const region = process.env.AWS_REGION;
        const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

        return {
            success: true,
            data: {
                fileName,
                publicUrl,
                mimetype: data.mimetype
            }
        };
    } catch (err) {
        console.error('S3 Upload Error:', err);
        throw new ErrorResponse('Error uploading file to storage', 500);
    }
};
