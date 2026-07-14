const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'elegance') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Delete an image from Cloudinary
const deleteFromCloudinary = async (public_id) => {
    return cloudinary.uploader.destroy(public_id);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
