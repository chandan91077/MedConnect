import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import pool from '../config/database.js';

class AdminController {
    // Create doctor account
    static async createDoctor(req, res) {
        try {
            const {
                email,
                password,
                name,
                specialization,
                qualification,
                experience,
                consultation_fee,
                emergency_fee,
                phone,
                bio,
                is_approved
            } = req.body;

            // Validation
            if (!email || !password || !name || !specialization || !consultation_fee || !emergency_fee) {
                return res.status(400).json({
                    success: false,
                    message: 'Required fields missing'
                });
            }

            // Check if email exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user with doctor role
            const userId = await User.create({
                email,
                password: hashedPassword,
                role: 'doctor'
            });

            // Create doctor profile
            const doctorId = await Doctor.create({
                user_id: userId,
                name,
                specialization,
                qualification,
                experience: experience || 0,
                consultation_fee,
                emergency_fee,
                phone,
                bio,
                is_approved: is_approved || false
            });

            const doctor = await Doctor.findById(doctorId);

            res.status(201).json({
                success: true,
                message: 'Doctor account created successfully',
                doctor
            });
        } catch (error) {
            console.error('Create doctor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create doctor account',
                error: error.message
            });
        }
    }

    // Get all doctors
    static async getAllDoctors(req, res) {
        try {
            const doctors = await Doctor.findAll();

            res.json({
                success: true,
                doctors
            });
        } catch (error) {
            console.error('Get all doctors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch doctors',
                error: error.message
            });
        }
    }

    // Get pending doctors
    static async getPendingDoctors(req, res) {
        try {
            const doctors = await Doctor.findAllPending();

            res.json({
                success: true,
                doctors
            });
        } catch (error) {
            console.error('Get pending doctors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch pending doctors',
                error: error.message
            });
        }
    }

    // Approve doctor
    static async approveDoctor(req, res) {
        try {
            const { id } = req.params;

            const success = await Doctor.approve(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const doctor = await Doctor.findById(id);

            res.json({
                success: true,
                message: 'Doctor approved successfully',
                doctor
            });
        } catch (error) {
            console.error('Approve doctor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve doctor',
                error: error.message
            });
        }
    }

    // Reject doctor
    static async rejectDoctor(req, res) {
        try {
            const { id } = req.params;

            const success = await Doctor.reject(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            res.json({
                success: true,
                message: 'Doctor rejected/unapproved successfully'
            });
        } catch (error) {
            console.error('Reject doctor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject doctor',
                error: error.message
            });
        }
    }

    // Set doctor availability
    static async setDoctorAvailability(req, res) {
        try {
            const { doctor_id, availability } = req.body;

            if (!doctor_id || !availability || !Array.isArray(availability)) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor ID and availability array are required'
                });
            }

            // Delete existing availability
            await Availability.deleteByDoctor(doctor_id);

            // Create new availability slots
            for (const slot of availability) {
                await Availability.create({
                    doctor_id,
                    day_of_week: slot.day_of_week,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    slot_duration: slot.slot_duration || 30
                });
            }

            const newAvailability = await Availability.findByDoctor(doctor_id);

            res.json({
                success: true,
                message: 'Doctor availability set successfully',
                availability: newAvailability
            });
        } catch (error) {
            console.error('Set availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to set doctor availability',
                error: error.message
            });
        }
    }

    // Get all appointments
    static async getAllAppointments(req, res) {
        try {
            const appointments = await Appointment.findAll();

            res.json({
                success: true,
                appointments
            });
        } catch (error) {
            console.error('Get all appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointments',
                error: error.message
            });
        }
    }

    // Get dashboard statistics
    static async getStats(req, res) {
        try {
            // Total doctors
            const [totalDoctorsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM doctors'
            );
            const totalDoctors = totalDoctorsResult[0].count;

            // Approved doctors
            const [approvedDoctorsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM doctors WHERE is_approved = TRUE'
            );
            const approvedDoctors = approvedDoctorsResult[0].count;

            // Pending doctors
            const [pendingDoctorsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM doctors WHERE is_approved = FALSE'
            );
            const pendingDoctors = pendingDoctorsResult[0].count;

            // Total patients
            const [totalPatientsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "patient"'
            );
            const totalPatients = totalPatientsResult[0].count;

            // Total appointments
            const [totalAppointmentsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM appointments'
            );
            const totalAppointments = totalAppointmentsResult[0].count;

            // Completed appointments
            const [completedAppointmentsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM appointments WHERE status = "completed"'
            );
            const completedAppointments = completedAppointmentsResult[0].count;

            // Total revenue
            const totalRevenue = await Payment.getTotalRevenue();

            // Today's appointments
            const [todayAppointmentsResult] = await pool.execute(
                'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()'
            );
            const todayAppointments = todayAppointmentsResult[0].count;

            res.json({
                success: true,
                stats: {
                    totalDoctors,
                    approvedDoctors,
                    pendingDoctors,
                    totalPatients,
                    totalAppointments,
                    completedAppointments,
                    totalRevenue,
                    todayAppointments
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: error.message
            });
        }
    }

    // Get all payments
    static async getAllPayments(req, res) {
        try {
            const payments = await Payment.findAll();

            res.json({
                success: true,
                payments
            });
        } catch (error) {
            console.error('Get all payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payments',
                error: error.message
            });
        }
    }

    // Update doctor
    static async updateDoctor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const doctor = await Doctor.update(id, updateData);

            res.json({
                success: true,
                message: 'Doctor updated successfully',
                doctor
            });
        } catch (error) {
            console.error('Update doctor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update doctor',
                error: error.message
            });
        }
    }
}

export default AdminController;
