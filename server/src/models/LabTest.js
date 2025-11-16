const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    sampleId: {
      type: String,
      required: [true, 'Sample ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal ID is required'],
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    labOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lab Officer ID is required'],
    },
    medicineTested: {
      type: String,
      required: [true, 'Medicine tested is required'],
      trim: true,
    },
    mrlValue: {
      type: Number,
      required: [true, 'MRL value is required'],
      min: 0,
    },
    mrlUnit: {
      type: String,
      enum: ['mg/kg', 'μg/kg', 'ppb'],
      default: 'mg/kg',
    },
    allowedLimit: {
      type: Number,
      required: [true, 'Allowed limit is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pass', 'fail'],
      required: [true, 'Status is required'],
    },
    reportUrl: {
      type: String,
      default: '',
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
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
labTestSchema.index({ animalId: 1, testDate: -1 });
labTestSchema.index({ status: 1, testDate: -1 });
labTestSchema.index({ sampleId: 1 });

// Virtual for checking if MRL is violated
labTestSchema.virtual('isViolation').get(function() {
  return this.mrlValue > this.allowedLimit;
});

module.exports = mongoose.model('LabTest', labTestSchema);

