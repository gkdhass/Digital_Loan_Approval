const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loanType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanType',
    required: true,
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1,
  },
  purpose: {
    type: String,
    required: true,
  },
  employmentDetails: {
    employmentType: String,
    companyName: String,
    designation: String,
    workExperienceYears: Number,
    monthlyIncome: Number,
  },
  emi: {
    type: Number,
    required: true,
  },
  totalPayable: {
    type: Number,
    required: true,
  },
  interestAmount: {
    type: Number,
    required: true,
  },
  processingFee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'documents_requested', 'approved', 'rejected', 'disbursed'],
    default: 'submitted',
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  aiAssessment: {
    aiConfidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiRecommendation: {
      type: String,
      enum: ['Likely Approved', 'Likely Rejected', 'Needs Review'],
    },
    aiReasoning: {
      type: String,
    },
    flaggedInconsistencies: [{
      type: String,
    }],
    processedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'not_available'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
    },
  },
  adminNotes: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  disbursedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Generate application number before saving
loanApplicationSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.applicationNumber = `LA${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
