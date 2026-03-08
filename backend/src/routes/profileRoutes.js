import express from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Profile routes (accessible by all authenticated users)
router.get('/', authenticate, AdminController.getProfile);
router.put('/', authenticate, AdminController.updateProfile);
router.post('/change-password', authenticate, AdminController.changePassword);

export default router;