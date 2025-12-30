import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import validator from 'validator';

class AuthController {
    // Register patient
    static async register(req, res) {
        try {
            const { email, password, full_name, phone } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const userId = await User.create({
                email,
                password: hashedPassword,
                role: 'patient'
            });

            // Create patient profile
            await PatientProfile.create({
                user_id: userId,
                full_name: full_name || null,
                phone: phone || null
            });

            // Generate JWT
            const token = jwt.sign(
                { id: userId, email, role: 'patient' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: userId,
                    email,
                    role: 'patient'
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    }

    // Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }

    // Get current user
    static async getCurrentUser(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get additional profile data based on role
            let profile = null;
            if (user.role === 'patient') {
                profile = await PatientProfile.findByUserId(user.id);
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    profile
                }
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user data',
                error: error.message
            });
        }
    }

    // Update patient profile
    static async updateProfile(req, res) {
        try {
            const { full_name, phone, date_of_birth, gender, address, medical_history, allergies } = req.body;

            const profileData = {};
            if (full_name) profileData.full_name = full_name;
            if (phone) profileData.phone = phone;
            if (date_of_birth) profileData.date_of_birth = date_of_birth;
            if (gender) profileData.gender = gender;
            if (address) profileData.address = address;
            if (medical_history) profileData.medical_history = medical_history;
            if (allergies) profileData.allergies = allergies;

            // Check if profile exists
            let profile = await PatientProfile.findByUserId(req.user.id);

            if (!profile) {
                // Create profile if doesn't exist
                profileData.user_id = req.user.id;
                await PatientProfile.create(profileData);
            } else {
                // Update existing profile
                await PatientProfile.update(req.user.id, profileData);
            }

            profile = await PatientProfile.findByUserId(req.user.id);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                profile
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message
            });
        }
    }
}

export default AuthController;
