import express from 'express';
import multer from 'multer';
import {
  getAllPhotosOfWeek,
  getPhotoOfWeekById,
  createPhotoOfWeek,
  updatePhotoOfWeek,
  deletePhotoOfWeek,
} from '../controllers/photoOfWeekController';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'));
    }
  },
});

router.get('/', getAllPhotosOfWeek);
router.get('/:id', getPhotoOfWeekById);
router.post('/', upload.single('thumbnail'), createPhotoOfWeek);
router.put('/:id', upload.single('thumbnail'), updatePhotoOfWeek);
router.delete('/:id', deletePhotoOfWeek);

export default router;
