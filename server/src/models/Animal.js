const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    animalName: {
      type: String,
      trim: true,
    },
    pashuAadhaarId: {
      type: String,
      required: [true, 'Pashu Aadhaar ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    tagId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    earTagNumber: {
      type: String,
      trim: true,
    },
    rfidNumber: {
      type: String,
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      enum: ['cow', 'buffalo', 'goat', 'sheep', 'poultry', 'other'],
    },
    breed: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      min: 0,
    },
    ageUnit: {
      type: String,
      enum: ['months', 'years'],
      default: 'years',
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'unhealthy'],
      default: 'healthy',
    },
    weight: {
      type: Number,
      min: 0,
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'grams'],
      default: 'kg',
    },
    // Farm Details
    farmName: {
      type: String,
      trim: true,
    },
    farmType: {
      type: String,
      enum: ['dairy', 'mixed'],
    },
    stallNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Vaccination & Records
    lastVaccinationDate: {
      type: Date,
    },
    vaccinationType: {
      type: String,
      trim: true,
    },
    previousIllnesses: {
      type: String,
      trim: true,
    },
    ongoingMedications: {
      type: String,
      trim: true,
    },
    // Photos
    frontPhoto: {
      type: String, // Base64 or URL
      default: '',
    },
    fullBodyPhoto: {
      type: String, // Base64 or URL
      default: '',
    },
    location: {
      village: String,
      district: String,
      state: String,
    },
    qrCode: {
      type: String,
      default: '',
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    latestTreatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
animalSchema.index({ farmerId: 1, createdAt: -1 });
animalSchema.index({ pashuAadhaarId: 1 });
animalSchema.index({ tagId: 1 });

module.exports = mongoose.model('Animal', animalSchema);

