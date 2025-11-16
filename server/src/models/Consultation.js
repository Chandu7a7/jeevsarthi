const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      default: null,
    },
    symptom: {
      type: String,
      required: [true, 'Symptom description is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'closed', 'rejected'],
      default: 'pending',
    },
    radius: {
      type: Number,
      default: 25000, // 25 km in meters
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
consultationSchema.index({ farmerId: 1, status: 1 });
consultationSchema.index({ vetId: 1, status: 1 });
consultationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);

