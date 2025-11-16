const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const { setupAlertSocket } = require('./sockets/alertSocket');
const { setupConsultationSocket } = require('./sockets/consultationSocket');
const scheduleAlertChecks = require('./jobs/alertScheduler');
const logger = require('./config/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Setup socket handlers
setupAlertSocket(io);
setupConsultationSocket(io);

// Make io available globally for use in services
app.set('io', io);

// Start scheduled jobs
scheduleAlertChecks();

// Start server
const PORT = process.env.PORT || 5000;

// Listen on all network interfaces (0.0.0.0) to allow mobile access
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Server accessible at: http://localhost:${PORT}`);
  
  // Log network IPs for QR code generation
  if (process.env.NODE_ENV !== 'production') {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const networkIPs = [];
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (!iface.internal && iface.family === 'IPv4') {
          networkIPs.push({ name, ip: iface.address });
        }
      }
    }
    
    if (networkIPs.length > 0) {
      logger.info(`📱 Network IPs for mobile access:`);
      networkIPs.forEach(({ name, ip }) => {
        logger.info(`   ${name}: http://${ip}:${PORT}`);
      });
    }
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

