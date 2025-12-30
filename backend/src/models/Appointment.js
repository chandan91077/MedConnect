import pool from '../config/database.js';

class Appointment {
    // Create appointment
    static async create(appointmentData) {
        const query = `
      INSERT INTO appointments (
        patient_id, doctor_id, appointment_date, appointment_time,
        type, status, zoom_join_url, zoom_start_url, zoom_meeting_id,
        is_chat_unlocked, is_video_unlocked, symptoms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            appointmentData.patient_id,
            appointmentData.doctor_id,
            appointmentData.appointment_date,
            appointmentData.appointment_time,
            appointmentData.type,
            appointmentData.status || 'pending',
            appointmentData.zoom_join_url,
            appointmentData.zoom_start_url,
            appointmentData.zoom_meeting_id,
            appointmentData.is_chat_unlocked || false,
            appointmentData.is_video_unlocked || false,
            appointmentData.symptoms || null
        ]);

        return result.insertId;
    }

    // Find appointment by ID
    static async findById(id) {
        const query = `
      SELECT 
        a.*,
        p.email as patient_email,
        pp.full_name as patient_name,
        pp.phone as patient_phone,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        d.phone as doctor_phone,
        d.profile_image as doctor_image
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      LEFT JOIN patient_profiles pp ON p.id = pp.user_id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Get all appointments for a patient
    static async findByPatient(patientId) {
        const query = `
      SELECT 
        a.*,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        d.profile_image as doctor_image
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
        const [rows] = await pool.execute(query, [patientId]);
        return rows;
    }

    // Get all appointments for a doctor
    static async findByDoctor(doctorId) {
        const query = `
      SELECT 
        a.*,
        p.email as patient_email,
        pp.full_name as patient_name,
        pp.phone as patient_phone
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      LEFT JOIN patient_profiles pp ON p.id = pp.user_id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
        const [rows] = await pool.execute(query, [doctorId]);
        return rows;
    }

    // Check if slot is available (for double booking prevention)
    static async isSlotAvailable(doctorId, date, time, connection = null) {
        const query = `
      SELECT id FROM appointments
      WHERE doctor_id = ? 
      AND appointment_date = ? 
      AND appointment_time = ?
      AND status != 'cancelled'
      FOR UPDATE
    `;

        const executor = connection || pool;
        const [rows] = await executor.execute(query, [doctorId, date, time]);
        return rows.length === 0;
    }

    // Check if doctor is in active call
    static async isDoctorInActiveCall(doctorId, connection = null) {
        const query = `
      SELECT id FROM appointments
      WHERE doctor_id = ?
      AND status = 'in_progress'
      AND type = 'emergency'
      FOR UPDATE
    `;

        const executor = connection || pool;
        const [rows] = await executor.execute(query, [doctorId]);
        return rows.length > 0;
    }

    // Update appointment
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE appointments SET ${fields} WHERE id = ?`;
        await pool.execute(query, [...values, id]);

        return this.findById(id);
    }

    // Unlock chat and video for appointments on appointment day
    static async unlockForToday() {
        const query = `
      UPDATE appointments
      SET is_chat_unlocked = TRUE, is_video_unlocked = TRUE
      WHERE appointment_date = CURDATE()
      AND type = 'scheduled'
      AND is_chat_unlocked = FALSE
    `;
        const [result] = await pool.execute(query);
        return result.affectedRows;
    }

    // Get all appointments (admin)
    static async findAll() {
        const query = `
      SELECT 
        a.*,
        p.email as patient_email,
        pp.full_name as patient_name,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      LEFT JOIN patient_profiles pp ON p.id = pp.user_id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Get upcoming appointments
    static async findUpcoming(userId, role) {
        let query;
        if (role === 'patient') {
            query = `
        SELECT 
          a.*,
          d.name as doctor_name,
          d.specialization as doctor_specialization,
          d.profile_image as doctor_image
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        AND a.appointment_date >= CURDATE()
        AND a.status != 'cancelled'
        ORDER BY a.appointment_date, a.appointment_time
      `;
        } else {
            query = `
        SELECT 
          a.*,
          p.email as patient_email,
          pp.full_name as patient_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        LEFT JOIN patient_profiles pp ON p.id = pp.user_id
        WHERE a.doctor_id = ?
        AND a.appointment_date >= CURDATE()
        AND a.status != 'cancelled'
        ORDER BY a.appointment_date, a.appointment_time
      `;
        }
        const [rows] = await pool.execute(query, [userId]);
        return rows;
    }

    // Cancel appointment
    static async cancel(id) {
        const query = 'UPDATE appointments SET status = ? WHERE id = ?';
        const [result] = await pool.execute(query, ['cancelled', id]);
        return result.affectedRows > 0;
    }
}

export default Appointment;
