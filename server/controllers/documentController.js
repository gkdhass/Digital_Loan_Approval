const Document = require('../models/Document');
const LoanApplication = require('../models/LoanApplication');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendDocumentVerifiedEmail, sendDocumentRejectedEmail } = require('../utils/emailService');
const { triggerAIAssessmentAsync, generateAIAssessment } = require('../utils/aiAssessmentService');
const { verifyDocumentOCR, requiresOCR } = require('../services/ocrService');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    console.log('[uploadDocument] Request received');
    console.log('[uploadDocument] req.file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    } : 'MISSING');
    console.log('[uploadDocument] req.body:', req.body);

    if (!req.file) {
      console.error('[uploadDocument] ERROR: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { applicationId, documentType } = req.body;

    if (!applicationId) {
      console.error('[uploadDocument] ERROR: Missing applicationId');
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    if (!documentType) {
      console.error('[uploadDocument] ERROR: Missing documentType');
      return res.status(400).json({
        success: false,
        message: 'Document type is required',
      });
    }

    console.log('[uploadDocument] Verifying application:', applicationId);

    // Verify application exists and belongs to user
    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      console.error('[uploadDocument] ERROR: Application not found:', applicationId);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.error('[uploadDocument] ERROR: Authorization failed');
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    console.log('[uploadDocument] Uploading to Cloudinary...');

    // Upload to Cloudinary from memory buffer (no disk write needed)
    // Convert buffer to base64 data URI for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'loan-documents',
      resource_type: 'auto',
    });

    console.log('[uploadDocument] Cloudinary upload successful:', result.public_id);

    // Create document record with OCR status pending if applicable
    const documentData = {
      application: applicationId,
      user: req.user._id,
      documentType,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    // Initialize OCR verification if document is PAN or Aadhaar
    if (requiresOCR(documentType)) {
      documentData.ocrVerification = {
        ocrStatus: 'pending',
      };
    }

    const document = await Document.create(documentData);

    console.log('[uploadDocument] Document created successfully:', document._id);

    // Trigger OCR verification asynchronously for PAN/Aadhaar documents
    if (requiresOCR(documentType)) {
      // Get user's full name for OCR comparison
      const user = await User.findById(req.user._id).select('fullName');
      const registeredName = user?.fullName || '';

      // Run OCR in background (non-blocking)
      processDocumentOCR(document._id, req.file.buffer, req.file.originalname, documentType, registeredName);
    }

    // Trigger AI assessment asynchronously (non-blocking)
    // This runs in the background without delaying the response
    triggerAIAssessmentAsync(applicationId);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('[uploadDocument] ERROR:', error.name, error.message);
    console.error('[uploadDocument] Stack:', error.stack);
    next(error);
  }
};

/**
 * Process document OCR in background (async, non-blocking)
 * @param {string} documentId - Document ID
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} documentType - Document type
 * @param {string} registeredName - User's registered name
 */
async function processDocumentOCR(documentId, fileBuffer, fileName, documentType, registeredName) {
  const OCR_PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  let timeoutId;
  
  try {
    console.log(`🔍 Starting OCR verification for document ${documentId}`);

    // Set a timeout to fallback to manual review if OCR takes too long
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('OCR processing timeout - fallback to manual review'));
      }, OCR_PROCESSING_TIMEOUT);
    });

    // Race between OCR processing and timeout
    const ocrResult = await Promise.race([
      verifyDocumentOCR(fileBuffer, fileName, documentType, registeredName),
      timeoutPromise
    ]);

    // Clear timeout if OCR completed successfully
    clearTimeout(timeoutId);

    // Update document with OCR results
    const document = await Document.findById(documentId);
    if (!document) {
      console.error('Document not found for OCR update:', documentId);
      return;
    }

    if (ocrResult.skip) {
      // Document doesn't require OCR - remove pending status
      document.ocrVerification = undefined;
    } else if (ocrResult.success || ocrResult.fallback) {
      // Update with OCR results
      document.ocrVerification = {
        ...document.ocrVerification,
        ...ocrResult.data,
      };
    }

    await document.save();

    console.log(`✅ OCR verification completed for document ${documentId}`);
    console.log(`   Status: ${document.ocrVerification?.ocrStatus || 'N/A'}`);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Error processing OCR:', error.message);
    
    // Update document with manual review required status
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        console.error('Document not found for OCR error update:', documentId);
        return;
      }

      // Check if this is a timeout error
      const isTimeout = error.message.includes('timeout');
      
      if (isTimeout) {
        console.warn(`⏱️  OCR timeout for document ${documentId} - marking for manual review`);
        
        document.ocrVerification = {
          ...document.ocrVerification,
          ocrStatus: 'manual_review_required',
          processedAt: new Date(),
          errorMessage: 'OCR processing took too long. Document requires manual admin review.',
        };
        
        // Set document verification status to pending so admin knows to review
        document.verificationStatus = 'pending';
        
        await document.save();
        
        // Create notification for admin
        await Notification.create({
          user: document.user,
          document: document._id,
          application: document.application,
          title: 'Document Under Manual Review',
          message: `Your document "${document.fileName}" is being reviewed by our team. This typically takes 1-2 business days.`,
          type: 'info',
        });
      } else {
        // Regular OCR failure
        document.ocrVerification = {
          ...document.ocrVerification,
          ocrStatus: 'failed',
          processedAt: new Date(),
          errorMessage: error.message,
        };
        
        await document.save();
      }
    } catch (updateError) {
      console.error('Failed to update document with OCR error status:', updateError.message);
    }
  }
}

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

    // Auto-fail OCR for documents stuck in 'pending' for more than the timeout threshold
    const OCR_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
    const now = new Date();
    
    for (const doc of documents) {
      if (doc.ocrVerification && doc.ocrVerification.ocrStatus === 'pending') {
        const uploadedAt = new Date(doc.uploadedAt);
        const timeSinceUpload = now - uploadedAt;
        
        if (timeSinceUpload > OCR_TIMEOUT_MS) {
          console.warn(`⏱️  OCR timeout detected for document ${doc._id} (stuck for ${Math.floor(timeSinceUpload / 1000)}s)`);
          console.warn(`   Marking document as requiring manual review`);
          
          const updatedDoc = await Document.findByIdAndUpdate(
            doc._id,
            {
              $set: {
                'ocrVerification.ocrStatus': 'manual_review_required',
                'ocrVerification.processedAt': new Date(),
                'ocrVerification.errorMessage': 'OCR processing exceeded time limit. Document requires manual admin review.',
                'verificationStatus': 'pending',
              },
            },
            { new: true }
          );
          
          // Update local document object to reflect changes
          Object.assign(doc, updatedDoc.toObject());
          
          // Create notification for user (only once)
          const existingNotification = await Notification.findOne({
            user: doc.user,
            document: doc._id,
            title: 'Document Under Manual Review',
          });
          
          if (!existingNotification) {
            await Notification.create({
              user: doc.user,
              document: doc._id,
              application: doc.application,
              title: 'Document Under Manual Review',
              message: `Your document "${doc.fileName}" is being reviewed by our team. This typically takes 1-2 business days.`,
              type: 'info',
            });
            
            console.log(`   Created user notification for manual review`);
          }
        }
      }
    }

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

// @desc    Trigger AI assessment for application (Admin)
// @route   POST /api/documents/ai-assessment/:applicationId
// @access  Private/Admin
exports.triggerAIAssessment = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if already processing
    if (application.aiAssessment && application.aiAssessment.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'AI assessment is already in progress',
      });
    }

    // Update status to pending
    application.aiAssessment = { status: 'pending' };
    await application.save();

    // Trigger assessment asynchronously
    triggerAIAssessmentAsync(applicationId);

    res.json({
      success: true,
      message: 'AI assessment triggered successfully',
      data: {
        status: 'pending',
        message: 'Assessment is being processed in the background',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI assessment status for application
// @route   GET /api/documents/ai-assessment/:applicationId
// @access  Private
exports.getAIAssessment = async (req, res, next) => {
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

    const aiAssessment = application.aiAssessment || { status: 'not_available' };

    res.json({
      success: true,
      data: aiAssessment,
    });
  } catch (error) {
    next(error);
  }
};
