import express from 'express';
import multer from 'multer';
import {
  uploadGalleryItems,
  getGalleryItems,
  deleteGalleryItem,
  updateGalleryItem,
} from '../controllers/galleryController';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Routes
router.post('/upload', upload.array('files', 20), uploadGalleryItems);
router.get('/:photoOfTheWeekId', getGalleryItems);
router.delete('/:id', deleteGalleryItem);
router.put('/:id', updateGalleryItem);

export default router;
