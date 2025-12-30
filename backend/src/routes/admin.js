import express from 'express';
import AdminController from '../controllers/adminController.js';
import authenticate from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Doctor management
router.post('/doctors', AdminController.createDoctor);
router.get('/doctors', AdminController.getAllDoctors);
router.get('/doctors/pending', AdminController.getPendingDoctors);
router.patch('/doctors/:id/approve', AdminController.approveDoctor);
router.patch('/doctors/:id/reject', AdminController.rejectDoctor);
router.put('/doctors/:id', AdminController.updateDoctor);

// Availability management
router.post('/availability', AdminController.setDoctorAvailability);

// Appointments
router.get('/appointments', AdminController.getAllAppointments);

// Payments
router.get('/payments', AdminController.getAllPayments);

// Statistics
router.get('/stats', AdminController.getStats);

export default router;
