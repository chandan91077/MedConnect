import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: false,
        });

        this.socket.connect();

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinChat(appointmentId) {
        if (this.socket) {
            this.socket.emit('join-chat', { appointment_id: appointmentId });
        }
    }

    leaveChat(appointmentId) {
        if (this.socket) {
            this.socket.emit('leave-chat', { appointment_id: appointmentId });
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('send-message', data);
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.on('receive-message', callback);
        }
    }

    onMessageHistory(callback) {
        if (this.socket) {
            this.socket.on('message-history', callback);
        }
    }

    onJoinedChat(callback) {
        if (this.socket) {
            this.socket.on('joined-chat', callback);
        }
    }

    offMessage() {
        if (this.socket) {
            this.socket.off('receive-message');
        }
    }
}

export default new SocketService();
