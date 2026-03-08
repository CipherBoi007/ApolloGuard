import express from 'express';
import NurseController from '../controllers/nurseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkRole } from '../middleware/roles.js';

const router = express.Router();

// Apply authentication and nurse authorization to all routes
router.use(authenticate);
router.use(authorize('nurse'));
router.use(checkRole);

// Dashboard
router.get('/dashboard/stats', NurseController.getDashboardStats);

// Patient management
router.post('/patients', NurseController.createPatient);
router.get('/patients', NurseController.getAllPatients);
router.get('/patients/search', NurseController.searchPatients);
router.get('/patients/:id', NurseController.getPatientById);
router.put('/patients/:id', NurseController.updatePatient);
router.delete('/patients/:id', NurseController.deletePatient);

// Doctor assignment
router.get('/doctors/available', NurseController.getAvailableDoctors);
router.post('/patients/:patientId/assign-doctor/:doctorId', NurseController.assignDoctorToPatient);

// Clinical records
router.post('/patients/:patientId/clinical-records', NurseController.createClinicalRecord);
router.get('/patients/:patientId/clinical-records', NurseController.getPatientClinicalRecords);
router.put('/clinical-records/:recordId', NurseController.updateClinicalRecord);
router.delete('/clinical-records/:recordId', NurseController.deleteClinicalRecord);

export default router;