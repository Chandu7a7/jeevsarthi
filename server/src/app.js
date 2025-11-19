const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const labRoutes = require('./routes/labRoutes');
const regulatorRoutes = require('./routes/regulatorRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and network IPs in development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    // Add FRONTEND_URL if set
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // In development, allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
    if (process.env.NODE_ENV !== 'production') {
      const localNetworkRegex = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development for easier testing
    }
  },
  credentials: true,
}));

// Body parser - increased limit for base64 image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'JEEVSARTHI API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/regulator', regulatorRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/animal', require('./routes/animalRoutes'));
app.use('/api/vet', require('./routes/vetRoutes'));
app.use('/api/admin', adminRoutes);

// Public route to get animal by Pashu Aadhaar ID (for QR scanning)
const farmerController = require('./controllers/farmerController');
app.get('/api/animals/:pashuAadhaarId', farmerController.getAnimalByPashuAadhaarId);

// Blockchain verification route (also checks for animal pashuAadhaarId)
app.get('/api/verify/:hash', async (req, res) => {
  try {
    const BlockchainRecord = require('./models/BlockchainRecord');
    const farmerService = require('./services/farmerService');
    
    // First check if it's a Pashu Aadhaar ID (starts with PASHU-)
    if (req.params.hash.startsWith('PASHU-')) {
      const animalResult = await farmerService.getAnimalByPashuAadhaarId(req.params.hash);
      if (animalResult.success) {
        return res.json({
          success: true,
          type: 'animal',
          data: animalResult.data,
        });
      }
    }

    // Otherwise, check blockchain records
    const record = await BlockchainRecord.findOne({ hash: req.params.hash });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Hash not found',
      });
    }

    res.json({
      success: true,
      type: 'blockchain',
      data: {
        hash: record.hash,
        type: record.type,
        timestamp: record.timestamp,
        verified: record.verified,
        data: record.data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification error',
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

