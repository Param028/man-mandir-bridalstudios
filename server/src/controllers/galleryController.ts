import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import GalleryItem from '../models/GalleryItem';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'gallery');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadGalleryItems = async (req: Request, res: Response) => {
  try {
    const { photoOfTheWeekId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    if (!photoOfTheWeekId) {
      return res.status(400).json({ message: 'photoOfTheWeekId is required' });
    }

    const uploadedItems = [];

    for (const file of files) {
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Write buffer to file
      fs.writeFileSync(filepath, file.buffer);
      
      const url = `/uploads/gallery/${filename}`;
      const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

      const galleryItem = await GalleryItem.create({
        photoOfTheWeekId: photoOfTheWeekId,
        url,
        publicId: filename,
        caption: file.originalname,
        type,
      });

      uploadedItems.push(galleryItem);
    }

    res.status(201).json(uploadedItems);
  } catch (error: any) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ message: error.message || 'Gallery upload failed' });
  }
};

export const getGalleryItems = async (req: Request, res: Response) => {
  try {
    const { photoOfTheWeekId } = req.params;

    const items = await GalleryItem.find({ photoOfTheWeekId: photoOfTheWeekId })
      .sort({ uploadedAt: -1 });

    // Convert local URLs to full URLs
    const itemsWithFullUrls = items.map((item) => ({
      ...item.toObject(),
      url: item.url.startsWith('http') 
        ? item.url 
        : `http://localhost:5000${item.url}`
    }));

    res.json(itemsWithFullUrls);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const galleryItem = await GalleryItem.findById(id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete file from filesystem
    const filepath = path.join(process.cwd(), 'uploads', 'gallery', galleryItem.publicId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await GalleryItem.findByIdAndDelete(id);

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const galleryItem = await GalleryItem.findByIdAndUpdate(
      id,
      { caption },
      { new: true }
    );

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const itemWithFullUrl = {
      ...galleryItem.toObject(),
      url: galleryItem.url.startsWith('http') 
        ? galleryItem.url 
        : `http://localhost:5000${galleryItem.url}`
    };

    res.json(itemWithFullUrl);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
