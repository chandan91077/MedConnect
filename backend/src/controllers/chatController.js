import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';

class ChatController {
    // Get messages for an appointment
    static async getMessages(req, res) {
        try {
            const { appointment_id } = req.params;

            // Check if user has access to this chat
            const appointment = await Appointment.findById(appointment_id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Authorization check
            if (
                req.user.role === 'patient' && appointment.patient_id !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if chat is unlocked
            if (!appointment.is_chat_unlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Chat is locked until appointment day'
                });
            }

            const messages = await Message.findByAppointment(appointment_id);

            res.json({
                success: true,
                messages
            });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch messages',
                error: error.message
            });
        }
    }

    // Send message (used as fallback if Socket.IO fails)
    static async sendMessage(req, res) {
        try {
            const { appointment_id, message_text, file_url, file_type } = req.body;

            const appointment = await Appointment.findById(appointment_id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Authorization check
            if (
                req.user.role === 'patient' && appointment.patient_id !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if chat is unlocked
            if (!appointment.is_chat_unlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Chat is locked until appointment day'
                });
            }

            const messageId = await Message.create({
                appointment_id,
                sender_id: req.user.id,
                message_text,
                file_url,
                file_type: file_type || 'text'
            });

            const message = await Message.findById(messageId);

            res.status(201).json({
                success: true,
                message
            });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    }
}

export default ChatController;
