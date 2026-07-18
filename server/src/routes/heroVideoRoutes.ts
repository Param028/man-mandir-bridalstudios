import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  uploadHeroVideo,
  getActiveHeroVideo,
  deleteHeroVideo,
  updateHeroVideoStatus,
} from '../controllers/heroVideoController';

const router = express.Router();

// Configure multer for disk storage (better for large files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// Routes
router.post('/upload', upload.single('video'), uploadHeroVideo);
router.get('/active', getActiveHeroVideo);
router.delete('/:id', deleteHeroVideo);
router.put('/:id/status', updateHeroVideoStatus);

export default router;
