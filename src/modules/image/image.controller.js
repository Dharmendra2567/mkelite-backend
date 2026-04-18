const DynamicImage = require('./image.model');
const { PutObjectCommand, DeleteObjectCommand, s3Client } = require('../../utils/s3');
const ErrorResponse = require('../../utils/errorResponse');
const crypto = require('crypto');
const path = require('path');

// @desc    Get all dynamic images
// @route   GET /api/v1/images
// @access  Public
exports.getImages = async (request, reply) => {
    const images = await DynamicImage.find({ active: true });
    return {
        success: true,
        count: images.length,
        data: images
    };
};

// @desc    Get single dynamic image by tag
// @route   GET /api/v1/images/tag/:tag
// @access  Public
exports.getImageByTag = async (request, reply) => {
    const image = await DynamicImage.findOne({ tag: request.params.tag, active: true });

    return {
        success: true,
        data: image || null
    };
};

// @desc    Create/Upload dynamic image
// @route   POST /api/v1/images
// @access  Private/Admin
exports.uploadImage = async (request, reply) => {
    const data = await request.file();
    if (!data) {
        throw new ErrorResponse('No file uploaded', 400);
    }

    const { tag, section, alt, title } = request.query;
    if (!tag) {
        throw new ErrorResponse('Please provide a tag for the image', 400);
    }

    // Check if tag already exists
    const existingImage = await DynamicImage.findOne({ tag });
    if (existingImage) {
        throw new ErrorResponse('An image with this tag already exists. Use PUT to update it.', 400);
    }

    const fileBuffer = await data.toBuffer();
    const ext = path.extname(data.filename);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const s3Key = `images/${fileName}`;

    const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: data.mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        const region = process.env.AWS_REGION;
        const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

        const image = await DynamicImage.create({
            tag,
            url: publicUrl,
            key: s3Key,
            section: section || 'other',
            alt: alt || '',
            title: title || ''
        });

        return {
            success: true,
            data: image
        };
    } catch (err) {
        console.error('S3 Upload Error:', err);
        throw new ErrorResponse(`Error uploading file to storage: ${err.message}`, 500);
    }
};

// @desc    Update dynamic image
// @route   PUT /api/v1/images/:id
// @access  Private/Admin
exports.updateImage = async (request, reply) => {
    let image = await DynamicImage.findById(request.params.id);

    if (!image) {
        throw new ErrorResponse(`Image not found with id of ${request.params.id}`, 404);
    }

    const data = await request.file();
    
    // If a new file is uploaded, replace the old one in S3
    if (data) {
        const fileBuffer = await data.toBuffer();
        const ext = path.extname(data.filename);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
        const bucketName = process.env.AWS_BUCKET_NAME;
        const s3Key = `images/${fileName}`;

        const params = {
            Bucket: bucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: data.mimetype,
        };

        try {
            // Upload new
            await s3Client.send(new PutObjectCommand(params));
            
            // Delete old
            const deleteParams = {
                Bucket: bucketName,
                Key: image.key,
            };
            await s3Client.send(new DeleteObjectCommand(deleteParams));

            const region = process.env.AWS_REGION;
            image.url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
            image.key = s3Key;
        } catch (err) {
            console.error('S3 Update Error:', err);
            throw new ErrorResponse(`Error updating storage: ${err.message}`, 500);
        }
    }

    // Update other fields
    const { tag, section, alt, title, active } = request.query;
    if (tag) image.tag = tag;
    if (section) image.section = section;
    if (alt !== undefined) image.alt = alt;
    if (title !== undefined) image.title = title;
    if (active !== undefined) image.active = active === 'true';

    await image.save();

    return {
        success: true,
        data: image
    };
};

// @desc    Delete dynamic image
// @route   DELETE /api/v1/images/:id
// @access  Private/Admin
exports.deleteImage = async (request, reply) => {
    const image = await DynamicImage.findById(request.params.id);

    if (!image) {
        throw new ErrorResponse(`Image not found with id of ${request.params.id}`, 404);
    }

    // Delete from S3
    const bucketName = process.env.AWS_BUCKET_NAME;
    const deleteParams = {
        Bucket: bucketName,
        Key: image.key,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (err) {
        console.error('S3 Delete Error:', err);
        // Continue with DB deletion even if S3 fails (or handle as preferred)
    }

    await image.deleteOne();

    return {
        success: true,
        data: {}
    };
};
