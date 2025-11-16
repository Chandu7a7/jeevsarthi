const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal ID is required'],
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    medicine: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    drugType: {
      type: String,
      enum: ['antibiotic', 'antiparasitic', 'vaccine', 'vitamin', 'other'],
      default: 'antibiotic',
    },
    dosage: {
      type: Number,
      required: [true, 'Dosage is required'],
      min: 0,
    },
    dosageUnit: {
      type: String,
      enum: ['mg', 'ml', 'units'],
      default: 'mg',
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['once', 'twice', 'thrice', 'daily', 'weekly'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks'],
      default: 'days',
    },
    dateGiven: {
      type: Date,
      required: [true, 'Date given is required'],
      default: Date.now,
    },
    withdrawalPeriod: {
      type: Number,
      required: [true, 'Withdrawal period is required'],
      min: 0,
    },
    withdrawalPeriodUnit: {
      type: String,
      enum: ['days', 'hours'],
      default: 'days',
    },
    withdrawalEndDate: {
      type: Date,
      required: [true, 'Withdrawal end date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'completed'],
      default: 'active',
    },
    prescriptionUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    images: {
      type: [String], // Array of base64 or URLs
      default: [],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    blockchainHash: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
treatmentSchema.index({ farmerId: 1, dateGiven: -1 });
treatmentSchema.index({ animalId: 1, status: 1 });
treatmentSchema.index({ withdrawalEndDate: 1, status: 1 });

module.exports = mongoose.model('Treatment', treatmentSchema);

