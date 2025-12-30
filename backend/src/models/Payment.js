import pool from '../config/database.js';

class Payment {
    // Create payment record
    static async create(paymentData) {
        const query = `
      INSERT INTO payments (
        appointment_id, patient_id, doctor_id, amount, 
        payment_method, status, transaction_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const metadataJson = paymentData.metadata ? JSON.stringify(paymentData.metadata) : null;

        const [result] = await pool.execute(query, [
            paymentData.appointment_id,
            paymentData.patient_id,
            paymentData.doctor_id,
            paymentData.amount,
            paymentData.payment_method || 'card',
            paymentData.status || 'pending',
            paymentData.transaction_id || null,
            metadataJson
        ]);

        return result.insertId;
    }

    // Get payment by ID
    static async findById(id) {
        const query = 'SELECT * FROM payments WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);

        if (rows[0] && rows[0].metadata) {
            rows[0].metadata = JSON.parse(rows[0].metadata);
        }

        return rows[0];
    }

    // Get payment by appointment
    static async findByAppointment(appointmentId) {
        const query = 'SELECT * FROM payments WHERE appointment_id = ?';
        const [rows] = await pool.execute(query, [appointmentId]);

        if (rows[0] && rows[0].metadata) {
            rows[0].metadata = JSON.parse(rows[0].metadata);
        }

        return rows[0];
    }

    // Get payments by patient
    static async findByPatient(patientId) {
        const query = `
      SELECT 
        p.*,
        d.name as doctor_name,
        a.appointment_date,
        a.appointment_time
      FROM payments p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query, [patientId]);

        return rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }

    // Get payments by doctor
    static async findByDoctor(doctorId) {
        const query = `
      SELECT 
        p.*,
        pat.email as patient_email,
        pp.full_name as patient_name,
        a.appointment_date,
        a.appointment_time
      FROM payments p
      JOIN users pat ON p.patient_id = pat.id
      LEFT JOIN patient_profiles pp ON pat.id = pp.user_id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query, [doctorId]);

        return rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }

    // Update payment status
    static async updateStatus(id, status, transactionId = null) {
        const query = `
      UPDATE payments 
      SET status = ?, transaction_id = COALESCE(?, transaction_id)
      WHERE id = ?
    `;
        const [result] = await pool.execute(query, [status, transactionId, id]);
        return result.affectedRows > 0;
    }

    // Get all payments (admin)
    static async findAll() {
        const query = `
      SELECT 
        p.*,
        pat.email as patient_email,
        pp.full_name as patient_name,
        d.name as doctor_name,
        a.appointment_date,
        a.appointment_time
      FROM payments p
      JOIN users pat ON p.patient_id = pat.id
      LEFT JOIN patient_profiles pp ON pat.id = pp.user_id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN appointments a ON p.appointment_id = a.id
      ORDER BY p.created_at DESC
    `;
        const [rows] = await pool.execute(query);

        return rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
    }

    // Get total revenue
    static async getTotalRevenue() {
        const query = `
      SELECT SUM(amount) as total_revenue
      FROM payments
      WHERE status = 'completed'
    `;
        const [rows] = await pool.execute(query);
        return rows[0]?.total_revenue || 0;
    }

    // Get revenue by doctor
    static async getRevenueByDoctor(doctorId) {
        const query = `
      SELECT SUM(amount) as total_revenue
      FROM payments
      WHERE doctor_id = ? AND status = 'completed'
    `;
        const [rows] = await pool.execute(query, [doctorId]);
        return rows[0]?.total_revenue || 0;
    }
}

export default Payment;
