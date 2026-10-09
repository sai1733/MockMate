import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';

/**
 * @desc    Upload and update candidate profile avatar
 * @route   POST /api/users/me/avatar
 * @access  Private (Candidate/User)
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Verify MIME type is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files (JPEG, PNG, WEBP, etc.) are allowed' });
    }

    // Stream memory buffer directly to Cloudinary using streamifier
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'mockmate/avatars',
            resource_type: 'image',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // Persist secure_url to user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarUrl: cloudinaryResult.secure_url } },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: updatedUser.avatarUrl,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading avatar to Cloudinary:', error);
    return res.status(500).json({
      message: error.message || 'Server error uploading avatar'
    });
  }
};
