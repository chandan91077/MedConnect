import pool from '../config/database.js';

class PatientProfile {
    // Create patient profile
    static async create(profileData) {
        const query = `
      INSERT INTO patient_profiles (
        user_id, full_name, phone, date_of_birth, gender,
        address, profile_image, medical_history, allergies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            profileData.user_id,
            profileData.full_name || null,
            profileData.phone || null,
            profileData.date_of_birth || null,
            profileData.gender || null,
            profileData.address || null,
            profileData.profile_image || null,
            profileData.medical_history || null,
            profileData.allergies || null
        ]);

        return result.insertId;
    }

    // Get profile by user ID
    static async findByUserId(userId) {
        const query = `
      SELECT pp.*, u.email
      FROM patient_profiles pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.user_id = ?
    `;
        const [rows] = await pool.execute(query, [userId]);
        return rows[0];
    }

    // Update profile
    static async update(userId, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE patient_profiles SET ${fields} WHERE user_id = ?`;
        await pool.execute(query, [...values, userId]);

        return this.findByUserId(userId);
    }

    // Get profile by ID
    static async findById(id) {
        const query = `
      SELECT pp.*, u.email
      FROM patient_profiles pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.id = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }
}

export default PatientProfile;
