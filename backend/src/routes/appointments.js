import express from 'express';
import AppointmentController from '../controllers/appointmentController.js';
import authenticate from '../middleware/auth.js';
import { requirePatient, requireDoctorOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Patient routes
router.post('/scheduled', requirePatient, AppointmentController.bookScheduledAppointment);
router.post('/emergency', requirePatient, AppointmentController.bookEmergencyAppointment);
router.get('/my', requirePatient, AppointmentController.getMyAppointments);

// Shared routes (patient, doctor, admin)
router.get('/:id', AppointmentController.getAppointment);
router.patch('/:id/cancel', AppointmentController.cancelAppointment);

// Doctor/Admin routes
router.patch('/:id/status', requireDoctorOrAdmin, AppointmentController.updateStatus);

export default router;
