const mongoose = require('mongoose');

const loanTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
  },
  maxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  minIncome: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDurationMonths: {
    type: Number,
    required: true,
    min: 1,
  },
  requiredDocuments: [{
    type: String,
    required: true,
  }],
  processingFeePercent: {
    type: Number,
    default: 1,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: 'file-text',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LoanType', loanTypeSchema);
