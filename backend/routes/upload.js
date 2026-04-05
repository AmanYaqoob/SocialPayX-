import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '../middleware/auth.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload
router.post('/', auth, async (req, res) => {
  try {
    const { file, resourceType = 'image' } = req.body;

    if (!file) return res.status(400).json({ message: 'No file provided' });

    // Only allow image or video
    if (!['image', 'video'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    const result = await cloudinary.uploader.upload(file, {
      resource_type: resourceType,
      folder:        'socialpayx',
      quality:       'auto',       // auto compress
      fetch_format:  'auto',       // best format for browser
    });

    res.json({
      url:  result.secure_url,
      type: resourceType,
    });

  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
