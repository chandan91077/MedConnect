import express from 'express';
import PrescriptionController from '../controllers/prescriptionController.js';
import authenticate from '../middleware/auth.js';
import { requireDoctorOrAdmin, requirePatient } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create prescription (doctor/admin only)
router.post('/', requireDoctorOrAdmin, PrescriptionController.createPrescription);

// Get prescriptions
router.get('/my', requirePatient, PrescriptionController.getPatientPrescriptions);
router.get('/:id', PrescriptionController.getPrescription);
router.get('/appointment/:appointment_id', PrescriptionController.getAppointmentPrescriptions);

export default router;
