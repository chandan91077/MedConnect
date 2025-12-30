import pool from '../config/database.js';

class Message {
    // Create message
    static async create(messageData) {
        const query = `
      INSERT INTO messages (appointment_id, sender_id, message_text, file_url, file_type)
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            messageData.appointment_id,
            messageData.sender_id,
            messageData.message_text || null,
            messageData.file_url || null,
            messageData.file_type || 'text'
        ]);

        return result.insertId;
    }

    // Get all messages for an appointment
    static async findByAppointment(appointmentId) {
        const query = `
      SELECT 
        m.*,
        u.email as sender_email,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.appointment_id = ?
      ORDER BY m.sent_at ASC
    `;
        const [rows] = await pool.execute(query, [appointmentId]);
        return rows;
    }

    // Get recent messages for an appointment
    static async findRecentByAppointment(appointmentId, limit = 50) {
        const query = `
      SELECT 
        m.*,
        u.email as sender_email,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.appointment_id = ?
      ORDER BY m.sent_at DESC
      LIMIT ?
    `;
        const [rows] = await pool.execute(query, [appointmentId, limit]);
        return rows.reverse(); // Return in ascending order
    }

    // Get message by ID
    static async findById(id) {
        const query = `
      SELECT 
        m.*,
        u.email as sender_email,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Delete message
    static async delete(id) {
        const query = 'DELETE FROM messages WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

export default Message;
