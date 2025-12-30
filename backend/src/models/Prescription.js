import pool from '../config/database.js';

class Prescription {
    // Create prescription
    static async create(prescriptionData) {
        const query = `
      INSERT INTO prescriptions (
        appointment_id, doctor_id, patient_id, diagnosis, 
        medications, instructions, pdf_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const medicationsJson = JSON.stringify(prescriptionData.medications);

        const [result] = await pool.execute(query, [
            prescriptionData.appointment_id,
            prescriptionData.doctor_id,
            prescriptionData.patient_id,
            prescriptionData.diagnosis,
            medicationsJson,
            prescriptionData.instructions || null,
            prescriptionData.pdf_url || null
        ]);

        return result.insertId;
    }

    // Get prescription by ID
    static async findById(id) {
        const query = `
      SELECT 
        p.*,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        pat.email as patient_email,
        pp.full_name as patient_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users pat ON p.patient_id = pat.id
      LEFT JOIN patient_profiles pp ON pat.id = pp.user_id
      WHERE p.id = ?
    `;
        const [rows] = await pool.execute(query, [id]);

        if (rows[0] && rows[0].medications) {
            rows[0].medications = JSON.parse(rows[0].medications);
        }

        return rows[0];
    }

    // Get prescriptions by appointment
    static async findByAppointment(appointmentId) {
        const query = `
      SELECT 
        p.*,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      WHERE p.appointment_id = ?
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query, [appointmentId]);

        return rows.map(row => ({
            ...row,
            medications: row.medications ? JSON.parse(row.medications) : []
        }));
    }

    // Get prescriptions by patient
    static async findByPatient(patientId) {
        const query = `
      SELECT 
        p.*,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        a.appointment_date,
        a.appointment_time
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query, [patientId]);

        return rows.map(row => ({
            ...row,
            medications: row.medications ? JSON.parse(row.medications) : []
        }));
    }

    // Get prescriptions by doctor
    static async findByDoctor(doctorId) {
        const query = `
      SELECT 
        p.*,
        pat.email as patient_email,
        pp.full_name as patient_name,
        a.appointment_date,
        a.appointment_time
      FROM prescriptions p
      JOIN users pat ON p.patient_id = pat.id
      LEFT JOIN patient_profiles pp ON pat.id = pp.user_id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query, [doctorId]);

        return rows.map(row => ({
            ...row,
            medications: row.medications ? JSON.parse(row.medications) : []
        }));
    }

    // Update prescription PDF URL
    static async updatePdfUrl(id, pdfUrl) {
        const query = 'UPDATE prescriptions SET pdf_url = ? WHERE id = ?';
        const [result] = await pool.execute(query, [pdfUrl, id]);
        return result.affectedRows > 0;
    }
}

export default Prescription;
