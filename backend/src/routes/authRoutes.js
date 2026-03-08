import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.changePassword); // Add this

export default router;