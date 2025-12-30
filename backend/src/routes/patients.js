import express from 'express';
import PatientController from '../controllers/patientController.js';
import authenticate from '../middleware/auth.js';
import { requirePatient } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate);
router.use(requirePatient);

router.get('/doctors', PatientController.getBrowseDoctors);
router.get('/doctors/:id', PatientController.getDoctorDetails);
router.get('/time-slots', PatientController.getDoctorTimeSlots);
router.get('/appointments/upcoming', PatientController.getUpcomingAppointments);

export default router;
