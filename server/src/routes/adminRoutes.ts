import express from 'express';
import { authAdmin, registerAdmin } from '../controllers/adminController';
import { protect, superAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', authAdmin);
// Only a Super Admin can register a new admin
router.post('/register', protect, superAdmin, registerAdmin);

export default router;
