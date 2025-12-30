import express from 'express';
import AuthController from '../controllers/authController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
