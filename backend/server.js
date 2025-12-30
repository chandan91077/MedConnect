import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import { testConnection } from './src/config/database.js';
import SocketHandler from './src/socket/socketHandler.js';
import { startCronJobs } from './src/jobs/unlockAppointments.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize Socket.IO handler
const socketHandler = new SocketHandler(io);

// Make socket handler available for controllers
app.set('socketHandler', socketHandler);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Start cron jobs
        startCronJobs();

        // Start HTTP server
        server.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 MediConnect Backend Server');
            console.log('='.repeat(50));
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌐 API: http://localhost:${PORT}`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Start the server
startServer();
