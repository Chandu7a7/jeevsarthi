const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
      unique: true,
    },
    // Personal Information
    fullName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      // Masked for security - only last 4 digits visible
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    languagesSpoken: {
      type: [String],
      default: [],
    },
    // Address / Location
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    blockTehsil: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },
    // Farm Details
    farmType: {
      type: String,
      enum: ['dairy', 'poultry', 'goat', 'sheep', 'mixed'],
      trim: true,
    },
    farmRegistrationId: {
      type: String,
      trim: true,
    },
    farmPhoto: {
      type: String,
      default: '',
    },
    // Compliance & Health Metrics
    amuComplianceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    violationsHistory: {
      safe: {
        type: Number,
        default: 0,
      },
      warning: {
        type: Number,
        default: 0,
      },
      violation: {
        type: Number,
        default: 0,
      },
    },
    kycStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    pashuMitraName: {
      type: String,
      trim: true,
    },
    pashuMitraContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
farmerProfileSchema.index({ farmerId: 1 });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);

