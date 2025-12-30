import pool from '../config/database.js';

class Doctor {
    // Create doctor profile
    static async create(doctorData) {
        const query = `
      INSERT INTO doctors (
        user_id, name, specialization, qualification, experience,
        consultation_fee, emergency_fee, phone, profile_image, bio, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            doctorData.user_id,
            doctorData.name,
            doctorData.specialization,
            doctorData.qualification,
            doctorData.experience || 0,
            doctorData.consultation_fee,
            doctorData.emergency_fee,
            doctorData.phone,
            doctorData.profile_image || null,
            doctorData.bio || null,
            doctorData.is_approved || false
        ]);

        return result.insertId;
    }

    // Get doctor by user ID
    static async findByUserId(userId) {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
    `;
        const [rows] = await pool.execute(query, [userId]);
        return rows[0];
    }

    // Get doctor by ID
    static async findById(id) {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Get all approved doctors
    static async findAllApproved() {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_approved = TRUE
      ORDER BY d.name
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Get all pending doctors (for admin)
    static async findAllPending() {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_approved = FALSE
      ORDER BY d.created_at DESC
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Get all doctors (for admin)
    static async findAll() {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Update doctor
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE doctors SET ${fields} WHERE id = ?`;
        await pool.execute(query, [...values, id]);

        return this.findById(id);
    }

    // Approve doctor
    static async approve(id) {
        const query = 'UPDATE doctors SET is_approved = TRUE WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Reject/Unapprove doctor
    static async reject(id) {
        const query = 'UPDATE doctors SET is_approved = FALSE WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Search doctors by specialization
    static async searchBySpecialization(specialization) {
        const query = `
      SELECT d.*, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_approved = TRUE AND d.specialization LIKE ?
      ORDER BY d.name
    `;
        const [rows] = await pool.execute(query, [`%${specialization}%`]);
        return rows;
    }

    // Check if doctor is approved
    static async isApproved(doctorId) {
        const query = 'SELECT is_approved FROM doctors WHERE id = ?';
        const [rows] = await pool.execute(query, [doctorId]);
        return rows[0]?.is_approved || false;
    }
}

export default Doctor;
