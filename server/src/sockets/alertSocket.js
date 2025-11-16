/**
 * Socket.IO handler for real-time alerts
 */
const setupAlertSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room based on their user ID
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

/**
 * Emit alert to specific user
 */
const emitAlert = (io, userId, alert) => {
  io.to(`user-${userId}`).emit('new-alert', alert);
};

/**
 * Emit withdrawal warning
 */
const emitWithdrawalWarning = (io, userId, alert) => {
  io.to(`user-${userId}`).emit('withdrawal-warning', alert);
};

/**
 * Emit MRL violation
 */
const emitMRLViolation = (io, userId, alert) => {
  io.to(`user-${userId}`).emit('mrl-violation', alert);
};

module.exports = {
  setupAlertSocket,
  emitAlert,
  emitWithdrawalWarning,
  emitMRLViolation,
};

