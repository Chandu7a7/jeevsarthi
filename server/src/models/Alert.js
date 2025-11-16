const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
    },
    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
    },
    labTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
    },
    type: {
      type: String,
      enum: ['safe', 'warning', 'violation'],
      required: [true, 'Alert type is required'],
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionTaken: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
alertSchema.index({ farmerId: 1, readStatus: 1, createdAt: -1 });
alertSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);

