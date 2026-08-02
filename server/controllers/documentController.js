const Document = require('../models/Document');
const LoanApplication = require('../models/LoanApplication');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendDocumentVerifiedEmail, sendDocumentRejectedEmail } = require('../utils/emailService');
const fs = require('fs');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { applicationId, documentType } = req.body;

    // Verify application exists and belongs to user
    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'loan-documents',
      resource_type: 'auto',
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Create document record
    const document = await Document.create({
      application: applicationId,
      user: req.user._id,
      documentType,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get documents for application
// @route   GET /api/documents/application/:applicationId
// @access  Private
exports.getApplicationDocuments = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization
    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const documents = await Document.find({ application: applicationId })
      .sort('-uploadedAt');

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify document (Admin)
// @route   PUT /api/documents/:id/verify
// @access  Private/Admin
exports.verifyDocument = async (req, res, next) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const previousStatus = document.verificationStatus;
    document.verificationStatus = verificationStatus;
    document.verifiedBy = req.user._id;
    document.verifiedAt = Date.now();
    
    if (rejectionReason) {
      document.rejectionReason = rejectionReason;
    }

    await document.save();

    // Get user and application for notifications
    const user = await User.findById(document.user);
    const application = await LoanApplication.findById(document.application);

    // Create notification and email for rejection
    if (verificationStatus === 'rejected' && previousStatus !== 'rejected') {
      await Notification.create({
        user: document.user,
        document: document._id,
        application: document.application,
        title: 'Document Rejected',
        message: `Your document "${document.fileName}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please upload a revised version.'}`,
        type: 'error',
      });

      // Send email
      if (user && application) {
        try {
          await sendDocumentRejectedEmail(user, document, application, rejectionReason);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
      }
    }

    // Create notification and email for verification
    if (verificationStatus === 'verified' && previousStatus !== 'verified') {
      await Notification.create({
        user: document.user,
        document: document._id,
        application: document.application,
        title: 'Document Verified',
        message: `Your document "${document.fileName}" has been verified successfully.`,
        type: 'success',
      });

      // Send email
      if (user && application) {
        try {
          await sendDocumentVerifiedEmail(user, document, application);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }
      }
    }

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: `verify_document_${verificationStatus}`,
      entityType: 'document',
      entityId: document._id,
      changes: {
        previousStatus,
        newStatus: verificationStatus,
        rejectionReason,
      },
    });

    res.json({
      success: true,
      message: 'Document verification updated',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check authorization
    if (document.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await cloudinary.uploader.destroy(document.cloudinaryId);
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
