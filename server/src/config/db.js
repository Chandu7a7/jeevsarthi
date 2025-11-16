const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jeevsarthi';
    
    logger.info(`Attempting to connect to MongoDB: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      logger.error('💡 MongoDB is not running. Please:');
      logger.error('   1. Start MongoDB locally, OR');
      logger.error('   2. Update MONGODB_URI in .env with MongoDB Atlas connection string');
      logger.error(`   Current URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/jeevsarthi'}`);
    }
    
    // Don't exit in development - allow server to start and show error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️  Server will continue but database operations will fail');
    }
  }
};

module.exports = connectDB;

