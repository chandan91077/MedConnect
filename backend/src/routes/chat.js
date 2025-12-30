import express from 'express';
import ChatController from '../controllers/chatController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:appointment_id/messages', ChatController.getMessages);
router.post('/message', ChatController.sendMessage);

export default router;
