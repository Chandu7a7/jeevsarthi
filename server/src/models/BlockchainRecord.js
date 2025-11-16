const mongoose = require('mongoose');

const blockchainRecordSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: [true, 'Hash is required'],
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['treatment', 'labtest', 'prescription', 'animal'],
      required: [true, 'Record type is required'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Reference ID is required'],
    },
    referenceModel: {
      type: String,
      enum: ['Treatment', 'LabTest', 'Animal', 'User'],
      required: [true, 'Reference model is required'],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Data is required'],
    },
    previousHash: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
blockchainRecordSchema.index({ hash: 1 });
blockchainRecordSchema.index({ type: 1, timestamp: -1 });
blockchainRecordSchema.index({ referenceId: 1, type: 1 });

module.exports = mongoose.model('BlockchainRecord', blockchainRecordSchema);

