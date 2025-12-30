import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    // Setup Socket.IO middleware for authentication
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                // Verify JWT
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role
                };

                next();
            } catch (error) {
                return next(new Error('Authentication error: Invalid token'));
            }
        });
    }

    // Setup event handlers
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`✅ User connected: ${socket.user.email} (${socket.user.role})`);

            // Join appointment room
            socket.on('join-chat', async (data) => {
                try {
                    const { appointment_id } = data;

                    // Verify user has access to this appointment
                    const appointment = await Appointment.findById(appointment_id);

                    if (!appointment) {
                        socket.emit('error', { message: 'Appointment not found' });
                        return;
                    }

                    // Check authorization
                    if (
                        socket.user.role === 'patient' && appointment.patient_id !== socket.user.id
                    ) {
                        socket.emit('error', { message: 'Access denied' });
                        return;
                    }

                    // Check if chat is unlocked
                    if (!appointment.is_chat_unlocked) {
                        socket.emit('error', { message: 'Chat is locked until appointment day' });
                        return;
                    }

                    // Join room
                    const roomName = `appointment_${appointment_id}`;
                    socket.join(roomName);
                    socket.currentRoom = roomName;

                    console.log(`User ${socket.user.email} joined room: ${roomName}`);

                    socket.emit('joined-chat', { appointment_id, room: roomName });

                    // Send recent messages
                    const messages = await Message.findRecentByAppointment(appointment_id, 50);
                    socket.emit('message-history', { messages });

                } catch (error) {
                    console.error('Join chat error:', error);
                    socket.emit('error', { message: 'Failed to join chat' });
                }
            });

            // Send message
            socket.on('send-message', async (data) => {
                try {
                    const { appointment_id, message_text, file_url, file_type } = data;

                    // Verify access
                    const appointment = await Appointment.findById(appointment_id);

                    if (!appointment || !appointment.is_chat_unlocked) {
                        socket.emit('error', { message: 'Cannot send message' });
                        return;
                    }

                    // Save message to database
                    const messageId = await Message.create({
                        appointment_id,
                        sender_id: socket.user.id,
                        message_text,
                        file_url: file_url || null,
                        file_type: file_type || 'text'
                    });

                    // Get full message data
                    const message = await Message.findById(messageId);

                    // Broadcast to room
                    const roomName = `appointment_${appointment_id}`;
                    this.io.to(roomName).emit('receive-message', { message });

                    console.log(`Message sent in room ${roomName} by ${socket.user.email}`);

                } catch (error) {
                    console.error('Send message error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Typing indicator
            socket.on('typing', (data) => {
                const { appointment_id } = data;
                const roomName = `appointment_${appointment_id}`;
                socket.to(roomName).emit('user-typing', {
                    user: socket.user.email,
                    role: socket.user.role
                });
            });

            socket.on('stop-typing', (data) => {
                const { appointment_id } = data;
                const roomName = `appointment_${appointment_id}`;
                socket.to(roomName).emit('user-stopped-typing', {
                    user: socket.user.email
                });
            });

            // Leave chat
            socket.on('leave-chat', (data) => {
                if (socket.currentRoom) {
                    socket.leave(socket.currentRoom);
                    console.log(`User ${socket.user.email} left room: ${socket.currentRoom}`);
                    socket.currentRoom = null;
                }
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`❌ User disconnected: ${socket.user.email}`);
            });
        });
    }

    // Emit prescription shared event
    emitPrescriptionShared(appointment_id, prescription) {
        const roomName = `appointment_${appointment_id}`;
        this.io.to(roomName).emit('prescription-shared', { prescription });
    }

    // Emit appointment update
    emitAppointmentUpdate(appointment_id, update) {
        const roomName = `appointment_${appointment_id}`;
        this.io.to(roomName).emit('appointment-update', { update });
    }
}

export default SocketHandler;
