import pool from '../config/database.js';

class Availability {
    // Create availability slot
    static async create(availabilityData) {
        const query = `
      INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, slot_duration)
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            availabilityData.doctor_id,
            availabilityData.day_of_week,
            availabilityData.start_time,
            availabilityData.end_time,
            availabilityData.slot_duration || 30
        ]);

        return result.insertId;
    }

    // Get availability by doctor ID
    static async findByDoctor(doctorId) {
        const query = `
      SELECT * FROM availability
      WHERE doctor_id = ?
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
               start_time
    `;
        const [rows] = await pool.execute(query, [doctorId]);
        return rows;
    }

    // Get availability by day
    static async findByDoctorAndDay(doctorId, dayOfWeek) {
        const query = `
      SELECT * FROM availability
      WHERE doctor_id = ? AND day_of_week = ?
      ORDER BY start_time
    `;
        const [rows] = await pool.execute(query, [doctorId, dayOfWeek]);
        return rows;
    }

    // Delete availability
    static async delete(id) {
        const query = 'DELETE FROM availability WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Delete all availability for a doctor
    static async deleteByDoctor(doctorId) {
        const query = 'DELETE FROM availability WHERE doctor_id = ?';
        const [result] = await pool.execute(query, [doctorId]);
        return result.affectedRows;
    }

    // Update availability
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE availability SET ${fields} WHERE id = ?`;
        await pool.execute(query, [...values, id]);

        return true;
    }
}

export default Availability;
