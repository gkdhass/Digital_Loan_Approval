const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanApplication',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Aadhar Card',
      'PAN Card',
      'Salary Slips (Last 3 months)',
      'Bank Statements (Last 6 months)',
      'Bank Statements (Last 12 months)',
      'Passport Photo',
      'Income Proof',
      'Property Documents',
      'Employment Proof',
      'Admission Letter',
      'Fee Structure',
      'Parent/Guardian Income Proof',
      'Academic Records',
      'Driving License',
      'Vehicle Quotation',
      'Address Proof',
      'Business Registration Certificate',
      'GST Registration',
      'ITR (Last 2 years)',
      'Business Plan',
      'Financial Statements',
      'Gold Ornaments',
      'Purity Certificate',
      'Land Ownership Documents',
      'Crop Details',
      'Village Revenue Records',
      'Property Valuation Report',
      'Title Deed',
      'Tax Receipts',
    ],
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  // OCR Verification Results (Part 4D)
  ocrVerification: {
    extractedName: {
      type: String,
    },
    extractedPAN: {
      type: String,
    },
    extractedAadhaar: {
      type: String,
    },
    nameMismatch: {
      type: Boolean,
    },
    nameSimilarity: {
      type: Number, // 0-100
      min: 0,
      max: 100,
    },
    invalidPAN: {
      type: Boolean,
    },
    invalidAadhaar: {
      type: Boolean,
    },
    confidence: {
      type: String,
      enum: ['high', 'low'],
    },
    ocrStatus: {
      type: String,
      enum: ['pending', 'processed', 'unreadable', 'failed'],
      default: 'pending',
    },
    processedAt: {
      type: Date,
    },
    rawText: {
      type: String, // First 500 chars for debugging
    },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
