import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import PhotoOfWeek from '../models/PhotoOfWeek';
import GalleryItem from '../models/GalleryItem';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'thumbnails');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const toFullUrl = (url: string) =>
  url.startsWith('http') ? url : `http://localhost:5000${url}`;

// GET all photos of the week
export const getAllPhotosOfWeek = async (req: Request, res: Response) => {
  try {
    const photos = await PhotoOfWeek.find().sort({ order: 1, createdAt: -1 });
    const result = photos.map((p) => ({
      ...p.toObject(),
      thumbnail: toFullUrl(p.thumbnail),
    }));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET single photo of the week
export const getPhotoOfWeekById = async (req: Request, res: Response) => {
  try {
    const photo = await PhotoOfWeek.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    res.json({ ...photo.toObject(), thumbnail: toFullUrl(photo.thumbnail) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create a new photo of the week (with thumbnail upload)
export const createPhotoOfWeek = async (req: Request, res: Response) => {
  try {
    const { title, order } = req.body;
    const file = req.file as Express.Multer.File;

    if (!file) return res.status(400).json({ message: 'Thumbnail image is required' });
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const thumbnail = `/uploads/thumbnails/${filename}`;

    const photo = await PhotoOfWeek.create({
      title,
      thumbnail,
      thumbnailPublicId: filename,
      order: Number(order) || 0,
    });

    res.status(201).json({ ...photo.toObject(), thumbnail: toFullUrl(photo.thumbnail) });
  } catch (error: any) {
    console.error('Create PhotoOfWeek error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT update photo of the week (title, order, optionally new thumbnail)
export const updatePhotoOfWeek = async (req: Request, res: Response) => {
  try {
    const { title, order, isActive } = req.body;
    const file = req.file as Express.Multer.File;

    const photo = await PhotoOfWeek.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });

    if (title !== undefined) photo.title = title;
    if (order !== undefined) photo.order = Number(order);
    if (isActive !== undefined) photo.isActive = isActive === 'true' || isActive === true;

    if (file) {
      // Delete old thumbnail
      const oldPath = path.join(process.cwd(), 'uploads', 'thumbnails', photo.thumbnailPublicId);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      photo.thumbnail = `/uploads/thumbnails/${filename}`;
      photo.thumbnailPublicId = filename;
    }

    await photo.save();
    res.json({ ...photo.toObject(), thumbnail: toFullUrl(photo.thumbnail) });
  } catch (error: any) {
    console.error('Update PhotoOfWeek error:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE photo of the week (and all its gallery items)
export const deletePhotoOfWeek = async (req: Request, res: Response) => {
  try {
    const photo = await PhotoOfWeek.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });

    // Delete thumbnail file
    const thumbPath = path.join(process.cwd(), 'uploads', 'thumbnails', photo.thumbnailPublicId);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    // Delete all gallery items for this photo
    const galleryItems = await GalleryItem.find({ photoOfTheWeekId: photo._id.toString() });
    for (const item of galleryItems) {
      const itemPath = path.join(process.cwd(), 'uploads', 'gallery', item.publicId);
      if (fs.existsSync(itemPath)) fs.unlinkSync(itemPath);
    }
    await GalleryItem.deleteMany({ photoOfTheWeekId: photo._id.toString() });

    await PhotoOfWeek.findByIdAndDelete(req.params.id);

    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
