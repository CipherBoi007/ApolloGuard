import express from 'express';
import PatientController from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkRole } from '../middleware/roles.js';

const router = express.Router();

// Apply authentication and patient authorization to all routes
router.use(authenticate);
router.use(authorize('patient'));
router.use(checkRole);

// Dashboard
router.get('/dashboard', PatientController.getDashboardStats);

// Profile
router.get('/profile', PatientController.getProfile);
router.put('/profile', PatientController.updateProfile);

// Medical Records
router.get('/clinical-records', PatientController.getMyClinicalRecords);
router.get('/diagnoses', PatientController.getMyDiagnoses);
router.get('/predictions', PatientController.getMyPredictions);
router.get('/predictions/latest', PatientController.getLatestPrediction);
router.get('/lab-results', PatientController.getMyLabResults);
router.get('/prescriptions', PatientController.getMyPrescriptions);

// Doctor Information
router.get('/my-doctor', PatientController.getMyDoctor);

// Appointments
router.get('/appointments', PatientController.getMyAppointments);
router.post('/appointments', PatientController.createAppointment);
router.put('/appointments/:appointmentId/cancel', PatientController.cancelAppointment);
router.put('/appointments/:appointmentId/reschedule', PatientController.rescheduleAppointment);

// Messages
router.get('/messages', PatientController.getMyMessages);
router.post('/messages', PatientController.sendMessage);
router.put('/messages/:messageId/read', PatientController.markMessageAsRead);

export default router;