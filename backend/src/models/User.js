import pool from '../config/database.js';

class User {
    // Create new user
    static async create({ email, password, role }) {
        const query = `
      INSERT INTO users (email, password, role)
      VALUES (?, ?, ?)
    `;

        const [result] = await pool.execute(query, [email, password, role]);
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT id, email, role, created_at FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Check if email exists
    static async emailExists(email) {
        const query = 'SELECT id FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows.length > 0;
    }

    // Update user
    static async update(id, data) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE users SET ${fields} WHERE id = ?`;
        await pool.execute(query, [...values, id]);

        return this.findById(id);
    }

    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Get all users by role
    static async findByRole(role) {
        const query = 'SELECT id, email, role, created_at FROM users WHERE role = ?';
        const [rows] = await pool.execute(query, [role]);
        return rows;
    }
}

export default User;
