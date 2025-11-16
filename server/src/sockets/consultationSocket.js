/**
 * Socket.IO handler for real-time consultation requests
 */
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const setupConsultationSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Consultation socket connected:', socket.id, 'User:', socket.userId);

    // Join user's room when they connect
    socket.on('join-consultation-room', () => {
      const userId = socket.userId; // comes from verified JWT on handshake
      if (!userId) {
        console.warn('join-consultation-room: socket has no userId');
        return;
      }
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined consultation room`);
      User.findByIdAndUpdate(userId, { onlineStatus: true }).catch(console.error);
    });
    

    // Chat handlers
    socket.on('join-consultation-chat', (consultationId) => {
      socket.join(`consultation-chat-${consultationId}`);
      console.log(`User ${socket.userId} joined chat for consultation ${consultationId}`);
      
      // Send chat history (in a real app, you'd fetch from database)
      socket.emit('chat-history', []);
    });

    socket.on('send-message', async (data) => {
      const { consultationId, message } = data;
      const messageData = {
        consultationId,
        senderId: socket.userId,
        senderName: socket.userName || 'User',
        senderRole: socket.userRole || 'user',
        text: message,
        timestamp: new Date(),
      };

      // Broadcast to all users in the consultation chat room
      io.to(`consultation-chat-${consultationId}`).emit('chat-message', messageData);
    });

    // Video call handlers
    socket.on('join-consultation-video', (consultationId) => {
      socket.join(`consultation-video-${consultationId}`);
      console.log(`User ${socket.userId} joined video for consultation ${consultationId}`);
    });

    socket.on('video-offer', (data) => {
      const { consultationId, offer } = data;
      socket.to(`consultation-video-${consultationId}`).emit('video-offer', offer);
    });

    socket.on('video-answer', (data) => {
      const { consultationId, answer } = data;
      socket.to(`consultation-video-${consultationId}`).emit('video-answer', answer);
    });

    socket.on('ice-candidate', (data) => {
      const { consultationId, candidate } = data;
      socket.to(`consultation-video-${consultationId}`).emit('ice-candidate', candidate);
    });

    socket.on('end-call', (data) => {
      const { consultationId } = data;
      socket.to(`consultation-video-${consultationId}`).emit('call-ended');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        // Update user's online status
        User.findByIdAndUpdate(socket.userId, { onlineStatus: false }).catch(console.error);
        console.log(`User ${socket.userId} disconnected from consultation`);
      }
    });
  });
};

/**
 * Emit consultation request to nearby vets
 * @param {Object} io - Socket.IO instance
 * @param {Object} consultation - Consultation object
 * @param {Array} nearbyVets - Array of nearby vet IDs
 */
const emitConsultationRequest = async (io, consultation, nearbyVets) => {
  try {
    const consultationData = {
      consultationId: consultation._id,
      farmerId: consultation.farmerId,
      farmerName: consultation.farmerId?.name || 'Farmer',
      mobileNumber: consultation.mobileNumber,
      symptom: consultation.symptom,
      location: consultation.location,
      animalId: consultation.animalId,
      createdAt: consultation.createdAt,
    };

    // Send request to each nearby vet
    nearbyVets.forEach((vet) => {
      consultationData.distance = vet.distanceKm;
      consultationData.distanceMeters = vet.distance;

      io.to(`user-${vet._id}`).emit('consultation-request', consultationData);
      console.log(`Consultation request sent to vet ${vet._id}`);
    });
  } catch (error) {
    console.error('Error emitting consultation request:', error);
  }
};

/**
 * Emit consultation accepted notification to farmer
 * @param {Object} io - Socket.IO instance
 * @param {Object} consultation - Consultation object
 */
const emitConsultationAccepted = async (io, consultation) => {
  try {
    const consultationData = {
      consultationId: consultation._id,
      vetId: consultation.vetId._id,
      vetName: consultation.vetId.name,
      vetEmail: consultation.vetId.email,
      vetPhone: consultation.vetId.phone,
      vetAvatar: consultation.vetId.avatar,
      acceptedAt: consultation.acceptedAt,
    };

    io.to(`user-${consultation.farmerId}`).emit('consultation-accepted', consultationData);
    console.log(`Consultation accepted notification sent to farmer ${consultation.farmerId}`);
  } catch (error) {
    console.error('Error emitting consultation accepted:', error);
  }
};

/**
 * Emit consultation closed notification to other vets
 * @param {Object} io - Socket.IO instance
 * @param {String} consultationId - Consultation ID
 * @param {String} acceptedVetId - ID of vet who accepted
 * @param {Array} otherVetIds - Array of other vet IDs to notify
 */
const emitConsultationClosed = async (io, consultationId, acceptedVetId, otherVetIds) => {
  try {
    const message = {
      consultationId,
      message: 'This consultation has already been accepted by another veterinarian',
      acceptedBy: acceptedVetId,
    };

    otherVetIds.forEach((vetId) => {
      io.to(`user-${vetId}`).emit('consultation-closed', message);
      console.log(`Consultation closed notification sent to vet ${vetId}`);
    });
  } catch (error) {
    console.error('Error emitting consultation closed:', error);
  }
};

/**
 * Emit consultation status update
 * @param {Object} io - Socket.IO instance
 * @param {Object} consultation - Consultation object
 */
const emitConsultationUpdate = async (io, consultation) => {
  try {
    const updateData = {
      consultationId: consultation._id,
      status: consultation.status,
      updatedAt: consultation.updatedAt,
    };

    // Notify farmer
    if (consultation.farmerId) {
      io.to(`user-${consultation.farmerId}`).emit('consultation-update', updateData);
    }

    // Notify vet
    if (consultation.vetId) {
      io.to(`user-${consultation.vetId}`).emit('consultation-update', updateData);
    }
  } catch (error) {
    console.error('Error emitting consultation update:', error);
  }
};

module.exports = {
  setupConsultationSocket,
  emitConsultationRequest,
  emitConsultationAccepted,
  emitConsultationClosed,
  emitConsultationUpdate,
};

