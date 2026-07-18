import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, manager } from '../middleware/authMiddleware';
import { upload } from '../config/cloudinary';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, manager, upload.array('images', 5), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, manager, upload.array('images', 5), updateProduct)
  .delete(protect, manager, deleteProduct);

export default router;
