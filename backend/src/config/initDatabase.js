import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const initDatabase = async () => {
    let connection;

    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('🔄 Initializing database...');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        console.log(`✅ Database "${process.env.DB_NAME}" created/verified`);

        // Create tables

        // 1. Users table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('patient', 'doctor', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Users table created');

        // 2. Doctors table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        qualification TEXT,
        experience INT DEFAULT 0,
        consultation_fee DECIMAL(10, 2) NOT NULL,
        emergency_fee DECIMAL(10, 2) NOT NULL,
        phone VARCHAR(20),
        profile_image VARCHAR(500),
        is_approved BOOLEAN DEFAULT FALSE,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_approved (is_approved),
        INDEX idx_specialization (specialization)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Doctors table created');

        // 3. Availability table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        slot_duration INT DEFAULT 30 COMMENT 'Duration in minutes',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_doctor_day (doctor_id, day_of_week)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Availability table created');

        // 4. Appointments table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        type ENUM('scheduled', 'emergency') NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'in_progress') DEFAULT 'pending',
        zoom_join_url VARCHAR(500),
        zoom_start_url VARCHAR(500),
        zoom_meeting_id VARCHAR(100),
        is_chat_unlocked BOOLEAN DEFAULT FALSE,
        is_video_unlocked BOOLEAN DEFAULT FALSE,
        symptoms TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_patient (patient_id),
        INDEX idx_doctor (doctor_id),
        INDEX idx_date (appointment_date),
        INDEX idx_status (status),
        UNIQUE KEY unique_scheduled_slot (doctor_id, appointment_date, appointment_time, type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Appointments table created');

        // 5. Messages table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id INT NOT NULL,
        sender_id INT NOT NULL,
        message_text TEXT,
        file_url VARCHAR(500),
        file_type ENUM('text', 'image', 'pdf', 'prescription') DEFAULT 'text',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_appointment (appointment_id),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Messages table created');

        // 6. Prescriptions table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id INT NOT NULL,
        doctor_id INT NOT NULL,
        patient_id INT NOT NULL,
        diagnosis TEXT,
        medications JSON,
        instructions TEXT,
        pdf_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_appointment (appointment_id),
        INDEX idx_patient (patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Prescriptions table created');

        // 7. Payments table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id INT NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'card',
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_patient (patient_id),
        INDEX idx_doctor (doctor_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Payments table created');

        // 8. Patient profiles table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        profile_image VARCHAR(500),
        medical_history TEXT,
        allergies TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Patient profiles table created');

        // Seed admin account
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        await connection.query(`
      INSERT IGNORE INTO users (email, password, role)
      VALUES (?, ?, 'admin')
    `, [process.env.ADMIN_EMAIL, hashedPassword]);

        console.log('✅ Admin account seeded');
        console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD}`);

        console.log('\n🎉 Database initialization completed successfully!\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initDatabase();
}

export default initDatabase;
