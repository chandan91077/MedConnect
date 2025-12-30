import Doctor from '../models/Doctor.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import pool from '../config/database.js';

class PatientController {
    // Get all approved doctors
    static async getBrowseDoctors(req, res) {
        try {
            const { specialization } = req.query;

            let doctors;
            if (specialization) {
                doctors = await Doctor.searchBySpecialization(specialization);
            } else {
                doctors = await Doctor.findAllApproved();
            }

            res.json({
                success: true,
                doctors
            });
        } catch (error) {
            console.error('Get browse doctors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch doctors',
                error: error.message
            });
        }
    }

    // Get doctor details with availability
    static async getDoctorDetails(req, res) {
        try {
            const { id } = req.params;

            const doctor = await Doctor.findById(id);

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            if (!doctor.is_approved) {
                return res.status(403).json({
                    success: false,
                    message: 'Doctor is not available for appointments'
                });
            }

            // Get availability
            const availability = await Availability.findByDoctor(id);

            res.json({
                success: true,
                doctor: {
                    ...doctor,
                    availability
                }
            });
        } catch (error) {
            console.error('Get doctor details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch doctor details',
                error: error.message
            });
        }
    }

    // Get doctor available time slots for a specific date
    static async getDoctorTimeSlots(req, res) {
        try {
            const { doctor_id, date } = req.query;

            if (!doctor_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor ID and date are required'
                });
            }

            // Get day of week from date
            const dateObj = new Date(date);
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = daysOfWeek[dateObj.getDay()];

            // Get availability for that day
            const availability = await Availability.findByDoctorAndDay(doctor_id, dayOfWeek);

            if (!availability || availability.length === 0) {
                return res.json({
                    success: true,
                    slots: []
                });
            }

            // Get existing appointments for that date
            const query = `
        SELECT appointment_time
        FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
      `;

            const [bookedSlots] = await pool.execute(query, [doctor_id, date]);
            const bookedTimes = bookedSlots.map(slot => slot.appointment_time);

            // Generate available time slots
            const slots = [];
            for (const avail of availability) {
                const startTime = avail.start_time;
                const endTime = avail.end_time;
                const slotDuration = avail.slot_duration;

                let currentTime = startTime;
                while (currentTime < endTime) {
                    if (!bookedTimes.includes(currentTime)) {
                        slots.push(currentTime);
                    }

                    // Add slot duration
                    const [hours, minutes] = currentTime.split(':').map(Number);
                    const totalMinutes = hours * 60 + minutes + slotDuration;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMinutes = totalMinutes % 60;
                    currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
                }
            }

            res.json({
                success: true,
                slots
            });
        } catch (error) {
            console.error('Get doctor time slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch time slots',
                error: error.message
            });
        }
    }

    // Get patient's upcoming appointments
    static async getUpcomingAppointments(req, res) {
        try {
            const appointments = await Appointment.findUpcoming(req.user.id, 'patient');

            res.json({
                success: true,
                appointments
            });
        } catch (error) {
            console.error('Get upcoming appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch upcoming appointments',
                error: error.message
            });
        }
    }
}

export default PatientController;
