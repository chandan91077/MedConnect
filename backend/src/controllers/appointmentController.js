import pool from '../config/database.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Payment from '../models/Payment.js';
import ZoomService from '../services/zoomService.js';

class AppointmentController {
    // Book scheduled appointment
    static async bookScheduledAppointment(req, res) {
        const connection = await pool.getConnection();

        try {
            const { doctor_id, appointment_date, appointment_time, symptoms } = req.body;
            const patient_id = req.user.id;

            // Validation
            if (!doctor_id || !appointment_date || !appointment_time) {
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Doctor, date, and time are required'
                });
            }

            // Start transaction
            await connection.beginTransaction();

            // Check if doctor is approved
            const doctor = await Doctor.findById(doctor_id);
            if (!doctor) {
                await connection.rollback();
                await connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            if (!doctor.is_approved) {
                await connection.rollback();
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Doctor is not approved for appointments'
                });
            }

            // Check if slot is available (with row locking)
            const isAvailable = await Appointment.isSlotAvailable(
                doctor_id,
                appointment_date,
                appointment_time,
                connection
            );

            if (!isAvailable) {
                await connection.rollback();
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Slot is already booked'
                });
            }

            // Create Zoom meeting
            const zoomMeeting = await ZoomService.createScheduledMeeting({
                date: appointment_date,
                time: appointment_time,
                doctor_name: doctor.name,
                duration: 30
            });

            // Create appointment
            const appointmentData = {
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                type: 'scheduled',
                status: 'confirmed',
                zoom_join_url: zoomMeeting.join_url,
                zoom_start_url: zoomMeeting.start_url,
                zoom_meeting_id: zoomMeeting.meeting_id,
                is_chat_unlocked: false,
                is_video_unlocked: false,
                symptoms
            };

            const query = `
        INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, appointment_time,
          type, status, zoom_join_url, zoom_start_url, zoom_meeting_id,
          is_chat_unlocked, is_video_unlocked, symptoms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [result] = await connection.execute(query, [
                appointmentData.patient_id,
                appointmentData.doctor_id,
                appointmentData.appointment_date,
                appointmentData.appointment_time,
                appointmentData.type,
                appointmentData.status,
                appointmentData.zoom_join_url,
                appointmentData.zoom_start_url,
                appointmentData.zoom_meeting_id,
                appointmentData.is_chat_unlocked,
                appointmentData.is_video_unlocked,
                appointmentData.symptoms
            ]);

            const appointmentId = result.insertId;

            // Create payment record
            const paymentQuery = `
        INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, status)
        VALUES (?, ?, ?, ?, ?)
      `;

            await connection.execute(paymentQuery, [
                appointmentId,
                patient_id,
                doctor_id,
                doctor.consultation_fee,
                'completed'
            ]);

            await connection.commit();
            await connection.release();

            const appointment = await Appointment.findById(appointmentId);

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                appointment
            });
        } catch (error) {
            await connection.rollback();
            await connection.release();
            console.error('Scheduled appointment booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book appointment',
                error: error.message
            });
        }
    }

    // Book emergency appointment
    static async bookEmergencyAppointment(req, res) {
        const connection = await pool.getConnection();

        try {
            const { doctor_id, symptoms } = req.body;
            const patient_id = req.user.id;

            if (!doctor_id) {
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Doctor ID is required'
                });
            }

            await connection.beginTransaction();

            // Check if doctor is approved
            const doctor = await Doctor.findById(doctor_id);
            if (!doctor || !doctor.is_approved) {
                await connection.rollback();
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Doctor is not available for emergency appointments'
                });
            }

            // Check if doctor is in active call
            const isInCall = await Appointment.isDoctorInActiveCall(doctor_id, connection);
            if (isInCall) {
                await connection.rollback();
                await connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Doctor is currently in an active call'
                });
            }

            // Create instant Zoom meeting
            const zoomMeeting = await ZoomService.createInstantMeeting({
                doctor_name: doctor.name
            });

            // Create appointment with unlocked chat and video
            const now = new Date();
            const appointmentDate = now.toISOString().split('T')[0];
            const appointmentTime = now.toTimeString().split(' ')[0].substring(0, 5);

            const query = `
        INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, appointment_time,
          type, status, zoom_join_url, zoom_start_url, zoom_meeting_id,
          is_chat_unlocked, is_video_unlocked, symptoms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

            const [result] = await connection.execute(query, [
                patient_id,
                doctor_id,
                appointmentDate,
                appointmentTime,
                'emergency',
                'in_progress',
                zoomMeeting.join_url,
                zoomMeeting.start_url,
                zoomMeeting.meeting_id,
                true,
                true,
                symptoms
            ]);

            const appointmentId = result.insertId;

            // Create payment record with emergency fee
            const paymentQuery = `
        INSERT INTO payments (appointment_id, patient_id, doctor_id, amount, status)
        VALUES (?, ?, ?, ?, ?)
      `;

            await connection.execute(paymentQuery, [
                appointmentId,
                patient_id,
                doctor_id,
                doctor.emergency_fee,
                'completed'
            ]);

            await connection.commit();
            await connection.release();

            const appointment = await Appointment.findById(appointmentId);

            res.status(201).json({
                success: true,
                message: 'Emergency appointment created successfully',
                appointment,
                doctor_phone: doctor.phone
            });
        } catch (error) {
            await connection.rollback();
            await connection.release();
            console.error('Emergency appointment booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book emergency appointment',
                error: error.message
            });
        }
    }

    // Get patient appointments
    static async getMyAppointments(req, res) {
        try {
            const appointments = await Appointment.findByPatient(req.user.id);

            res.json({
                success: true,
                appointments
            });
        } catch (error) {
            console.error('Get appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointments',
                error: error.message
            });
        }
    }

    // Get single appointment
    static async getAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check authorization
            if (
                req.user.role === 'patient' && appointment.patient_id !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                appointment
            });
        } catch (error) {
            console.error('Get appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointment',
                error: error.message
            });
        }
    }

    // Cancel appointment
    static async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check authorization
            if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await Appointment.cancel(id);

            res.json({
                success: true,
                message: 'Appointment cancelled successfully'
            });
        } catch (error) {
            console.error('Cancel appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel appointment',
                error: error.message
            });
        }
    }

    // Update appointment status
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const appointment = await Appointment.update(id, { status });

            res.json({
                success: true,
                message: 'Appointment status updated',
                appointment
            });
        } catch (error) {
            console.error('Update appointment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment status',
                error: error.message
            });
        }
    }
}

export default AppointmentController;
