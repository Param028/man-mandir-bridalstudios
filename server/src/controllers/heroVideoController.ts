import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import HeroVideo from '../models/HeroVideo';

// Configure Cloudinary (only if credentials are provided)
const cloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadHeroVideo = async (req: Request, res: Response) => {
  try {
    console.log('Upload request received');
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No video file provided' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);
    let videoUrl: string;
    let publicId: string;
    const tempPath = req.file.path;

    if (cloudinaryConfigured) {
      console.log('Uploading to Cloudinary...');
      // Upload video to Cloudinary
      const result = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'video',
        folder: 'manmandir/hero-videos',
        allowed_formats: ['mp4', 'webm'],
      });
      videoUrl = result.secure_url;
      publicId = result.public_id;
      
      // Clean up temp file
      fs.unlinkSync(tempPath);
      console.log('Cloudinary upload complete');
    } else {
      console.log('Using local storage...');
      // Move file from temp to final location
      const filename = `${Date.now()}-${req.file.originalname}`;
      const finalPath = path.join(uploadsDir, filename);
      
      console.log('Moving file from', tempPath, 'to', finalPath);
      // Async file move
      await fs.promises.rename(tempPath, finalPath);
      
      videoUrl = `/uploads/videos/${filename}`;
      publicId = filename;
      console.log('File move complete');
    }

    console.log('Deactivating existing videos...');
    // Deactivate all existing videos
    await HeroVideo.updateMany({}, { isActive: false });

    console.log('Creating new video record...');
    // Create new hero video
    const heroVideo = await HeroVideo.create({
      url: videoUrl,
      publicId,
      title: req.body.title || 'Hero Video',
      isActive: true,
    });

    console.log('Upload complete, sending response');
    res.status(201).json({
      _id: heroVideo._id,
      url: heroVideo.url,
      title: heroVideo.title,
      isActive: heroVideo.isActive,
      uploadedAt: heroVideo.uploadedAt,
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    
    // Clean up temp file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: error.message || 'Video upload failed' });
  }
};

export const getActiveHeroVideo = async (req: Request, res: Response) => {
  try {
    const heroVideo = await HeroVideo.findOne({ isActive: true });
    
    if (!heroVideo) {
      return res.status(404).json({ message: 'No active hero video found' });
    }

    res.json({
      _id: heroVideo._id,
      url: heroVideo.url,
      title: heroVideo.title,
      isActive: heroVideo.isActive,
      uploadedAt: heroVideo.uploadedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHeroVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const heroVideo = await HeroVideo.findById(id);

    if (!heroVideo) {
      return res.status(404).json({ message: 'Hero video not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(heroVideo.publicId, { resource_type: 'video' });

    // Delete from database
    await HeroVideo.findByIdAndDelete(id);

    res.json({ message: 'Hero video deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHeroVideoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive) {
      // Deactivate all other videos
      await HeroVideo.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const heroVideo = await HeroVideo.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!heroVideo) {
      return res.status(404).json({ message: 'Hero video not found' });
    }

    res.json({
      _id: heroVideo._id,
      url: heroVideo.url,
      title: heroVideo.title,
      isActive: heroVideo.isActive,
      uploadedAt: heroVideo.uploadedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
