const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ['antibiotic', 'antiparasitic', 'vaccine', 'vitamin', 'hormone', 'other'],
      required: [true, 'Drug category is required'],
    },
    mrlLimit: {
      type: Number,
      required: [true, 'MRL limit is required'],
      min: 0,
      default: 0.1, // mg/kg
    },
    mrlLimitUnit: {
      type: String,
      enum: ['mg/kg', 'μg/kg', 'ppb'],
      default: 'mg/kg',
    },
    withdrawalPeriodMilk: {
      type: Number,
      required: [true, 'Withdrawal period for milk is required'],
      min: 0,
      default: 0, // days
    },
    withdrawalPeriodMeat: {
      type: Number,
      required: [true, 'Withdrawal period for meat is required'],
      min: 0,
      default: 0, // days
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    toxicityByAge: {
      type: {
        calves: {
          type: String,
          enum: ['safe', 'caution', 'unsafe'],
          default: 'safe',
        },
        adults: {
          type: String,
          enum: ['safe', 'caution', 'unsafe'],
          default: 'safe',
        },
        pregnant: {
          type: String,
          enum: ['safe', 'caution', 'unsafe'],
          default: 'safe',
        },
      },
      default: {
        calves: 'safe',
        adults: 'safe',
        pregnant: 'safe',
      },
    },
    allowed: {
      type: Boolean,
      default: true,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    interactions: {
      type: [String], // Array of drug names that interact
      default: [],
    },
    alternatives: {
      type: [String], // Array of alternative drug names
      default: [],
    },
    safeDosageMgKg: {
      type: Number,
      required: [true, 'Safe dosage is required'],
      min: 0,
      default: 10, // mg/kg
    },
    dosageUnit: {
      type: String,
      enum: ['mg/kg', 'ml/kg', 'units/kg'],
      default: 'mg/kg',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
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

// Indexes for faster queries
drugSchema.index({ drugName: 1 });
drugSchema.index({ category: 1 });
drugSchema.index({ riskLevel: 1 });
drugSchema.index({ allowed: 1, banned: 1 });

module.exports = mongoose.model('Drug', drugSchema);

