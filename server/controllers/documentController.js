const Document = require('../models/Document');
const LoanApplication = require('../models/LoanApplication');
const cloudinary = require('../config/cloudinary');
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

    document.verificationStatus = verificationStatus;
    document.verifiedBy = req.user._id;
    document.verifiedAt = Date.now();
    
    if (rejectionReason) {
      document.rejectionReason = rejectionReason;
    }

    await document.save();

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
