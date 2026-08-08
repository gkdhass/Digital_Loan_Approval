const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    unique: true,
    // Not marked as required because it's auto-generated in pre-save hook
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
  // Eligibility Score (Part 4B)
  eligibilityScore: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    isEligible: {
      type: Boolean,
    },
    reason: {
      type: String,
    },
    factors: {
      income: {
        score: { type: Number },
        stars: { type: Number },
        label: { type: String },
        ratio: { type: String },
      },
      employment: {
        score: { type: Number },
        stars: { type: Number },
        label: { type: String },
        type: { type: String },
      },
      debtToIncome: {
        score: { type: Number },
        stars: { type: Number },
        label: { type: String },
        ratio: { type: String },
      },
    },
    calculatedAt: { type: Date },
  },
  // AI Risk Assessment (Part 4A)
  riskAssessment: {
    approvalProbability: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
    },
    recommendation: {
      type: String,
      enum: ['Approve', 'Review', 'Reject'],
    },
    factors: {
      incomeToLoanRatio: Number,
      employmentStability: Number,
      debtToIncomeRatio: Number,
      loanDurationRisk: Number,
      ageFactor: Number,
    },
    assessedAt: Date,
    modelVersion: String,
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'pending',
    },
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
// NOTE: Use a regular (non-async) function — `this` binding requires it.
// No await needed here so async is unnecessary and causes double-resolution
// issues with Mongoose 6+ when combined with next().
loanApplicationSchema.pre('save', function(next) {
  if (!this.applicationNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.applicationNumber = `LA${timestamp}${random}`;
    console.log('[LoanApplication] Generated applicationNumber:', this.applicationNumber);
  }
  next();
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
