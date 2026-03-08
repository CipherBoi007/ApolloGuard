import express from 'express';
import DoctorController from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkRole } from '../middleware/roles.js';

const router = express.Router();

// Apply authentication and doctor authorization to all routes
router.use(authenticate);
router.use(authorize('doctor'));
router.use(checkRole);

// Dashboard
router.get('/dashboard/stats', DoctorController.getDashboardStats);

// Patient management
router.get('/patients', DoctorController.getPatients);
router.get('/patients/:patientId', DoctorController.getPatientDetails);
router.post('/patients/:patientId/assign', DoctorController.assignPatientToDoctor);

// Diagnosis management
router.post('/patients/:patientId/diagnoses', DoctorController.createDiagnosis);

// Predictions
router.post('/predictions/:clinicalRecordId/generate', DoctorController.generatePrediction);
router.get('/predictions/:predictionId', DoctorController.getPrediction);
router.get('/patients/:patientId/predictions', DoctorController.getPatientPredictions);
router.get('/predictions/stats/overview', DoctorController.getPredictionStats);

// Schedule
router.get('/schedule', DoctorController.getSchedule);
router.put('/schedule/:appointmentId', DoctorController.updateAppointmentStatus);

// Reports
router.get('/reports', DoctorController.getReports);
router.post('/reports/generate', DoctorController.generateReport);

export default router;