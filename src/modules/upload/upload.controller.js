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

    // Support for folders (e.g., ?folder=resume)
    const folder = request.query.folder ? `${request.query.folder}/` : '';
    const s3Key = `${folder}${fileName}`;

    const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: data.mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));

        // Construct public URL (Assuming bucket is public or using CloudFront)
        const region = process.env.AWS_REGION;
        const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

        return {
            success: true,
            data: {
                fileName,
                publicUrl,
                s3Key,
                mimetype: data.mimetype
            }
        };
    } catch (err) {
        console.error('S3 Upload Error:', err);
        // Return specific error message for debugging
        throw new ErrorResponse(`Error uploading file to storage: ${err.message}`, 500);
    }
};
