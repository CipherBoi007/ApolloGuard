import express from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', AdminController.getDashboardStats);

// Analytics
router.get('/analytics', AdminController.getDetailedAnalytics);

// User Management
router.post('/users', AdminController.createUser);
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/promote', AdminController.promoteToAdmin);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;