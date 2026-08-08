const LoanApplication = require('../models/LoanApplication');
const LoanType = require('../models/LoanType');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Document = require('../models/Document');
const { generateLoanAgreement } = require('../utils/pdfGenerator');
const {
  sendDocumentsRequestedEmail,
} = require('../utils/emailService');
const { predictLoanRisk } = require('../services/aiService');
const { calculateEligibilityScore } = require('../utils/eligibilityScore');

// @desc    Create loan application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const { loanType, loanAmount, durationMonths, purpose, employmentDetails } = req.body;

    console.log('[createApplication] Incoming payload:', JSON.stringify({
      loanType, loanAmount, durationMonths, purpose,
      employmentType: employmentDetails?.employmentType,
      monthlyIncome: employmentDetails?.monthlyIncome,
    }));

    const loanTypeData = await LoanType.findById(loanType);
    if (!loanTypeData) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    // Calculate EMI
    const monthlyRate = loanTypeData.interestRate / 12 / 100;
    const emi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1)
    );

    const totalPayable = emi * durationMonths;
    const interestAmount = totalPayable - loanAmount;
    const processingFee = Math.round((loanAmount * loanTypeData.processingFeePercent) / 100);

    // Calculate eligibility score
    const eligibilityScoreData = calculateEligibilityScore({
      monthlyIncome: employmentDetails.monthlyIncome,
      requestedAmount: loanAmount,
      employmentType: employmentDetails.employmentType || 'other',
      existingEMI: 0, // Can be extended to track existing EMIs
      loanDuration: durationMonths,
    });

    // Generate applicationNumber here explicitly — belt-and-suspenders alongside the
    // pre-save hook, ensuring the field is set before Mongoose validation runs.
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const applicationNumber = `LA${timestamp}${random}`;
    console.log('[createApplication] Generated applicationNumber:', applicationNumber);

    const application = new LoanApplication({
      applicationNumber,
      user: req.user._id,
      loanType,
      loanAmount,
      durationMonths,
      purpose,
      employmentDetails,
      emi,
      totalPayable,
      interestAmount,
      processingFee,
      eligibilityScore: eligibilityScoreData,
    });
    await application.save();

    // Call AI service for risk prediction (non-blocking)
    // If AI service fails, application still succeeds
    const aiResult = await predictLoanRisk({
      monthlyIncome: employmentDetails.monthlyIncome,
      employmentType: employmentDetails.employmentType,
      existingEMI: 0, // Can be extended to track existing EMIs
      requestedAmount: loanAmount,
      loanDuration: durationMonths,
      age: req.user.age || 30, // Get from user profile if available
    });

    // Update application with risk assessment
    if (aiResult.success && aiResult.data) {
      application.riskAssessment = {
        approvalProbability: aiResult.data.approvalProbability,
        riskLevel: aiResult.data.riskLevel,
        recommendation: aiResult.data.recommendation,
        factors: aiResult.data.factors,
        assessedAt: new Date(),
        modelVersion: aiResult.data.metadata?.modelVersion || 'unknown',
        status: 'completed',
      };
    } else {
      // AI service failed - mark as pending
      application.riskAssessment = {
        status: 'pending',
      };
      console.warn('⚠️  AI risk assessment not available, application will proceed with manual review');
    }

    await application.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      application: application._id,
      title: 'Application Submitted',
      message: `Your loan application ${application.applicationNumber} has been submitted successfully`,
      type: 'success',
    });

    // Note: Application submission email is handled by EmailJS Auto-Reply on the frontend
    // Admin-triggered emails (approved/rejected) are handled by backend Nodemailer

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'create_application',
      entityType: 'application',
      entityId: application._id,
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('[createApplication] Error:', error.name, error.message);
    if (error.errors) {
      console.error('[createApplication] Validation fields failed:', Object.keys(error.errors));
    }
    next(error);
  }
};

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
exports.getUserApplications = async (req, res, next) => {
  try {
    const applications = await LoanApplication.find({ user: req.user._id })
      .populate('loanType', 'name interestRate')
      .sort('-createdAt');

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    console.log('[getApplicationById] Request for ID:', req.params.id);
    console.log('[getApplicationById] Requested by user:', {
      userId: req.user._id,
      role: req.user.role,
    });

    const application = await LoanApplication.findById(req.params.id)
      .populate('loanType')
      .populate('user', 'fullName email phone address')
      .populate('reviewedBy', 'fullName email');

    if (!application) {
      console.log('[getApplicationById] NOT FOUND - No application with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.log('[getApplicationById] Found application:', {
      id: application._id,
      applicationNumber: application.applicationNumber,
      userId: application.user._id,
      status: application.status,
    });

    // Check authorization
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('[getApplicationById] UNAUTHORIZED - User does not own this application');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    console.log('[getApplicationById] SUCCESS - Returning application');

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('[getApplicationById] ERROR:', {
      id: req.params.id,
      error: error.message,
      name: error.name,
    });
    next(error);
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications/admin/all
// @access  Private/Admin
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { 'user.fullName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { applicationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortObj = {};
    if (sortBy === 'user.fullName') {
      sortObj['user.fullName'] = sortOrder;
    } else if (sortBy === 'loanAmount') {
      sortObj.loanAmount = sortOrder;
    } else if (sortBy === 'status') {
      sortObj.status = sortOrder;
    } else {
      sortObj.createdAt = sortOrder;
    }

    const applications = await LoanApplication.find(query)
      .populate('loanType', 'name')
      .populate('user', 'fullName email phone')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await LoanApplication.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    console.log('[updateApplicationStatus] Request:', {
      applicationId: req.params.id,
      newStatus: req.body.status,
      hasAdminNotes: !!req.body.adminNotes,
      hasRejectionReason: !!req.body.rejectionReason,
      adminId: req.user._id,
    });

    const { status, adminNotes, rejectionReason } = req.body;

    const application = await LoanApplication.findById(req.params.id)
      .populate('loanType')
      .populate('user', 'fullName email phone address')
      .populate('reviewedBy', 'fullName email');
    
    if (!application) {
      console.log('[updateApplicationStatus] NOT FOUND:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.log('[updateApplicationStatus] Found application:', {
      id: application._id,
      currentStatus: application.status,
    });

    const previousStatus = application.status;
    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    
    if (adminNotes) application.adminNotes = adminNotes;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    
    if (status === 'approved') application.approvedAt = Date.now();
    if (status === 'disbursed') application.disbursedAt = Date.now();

    await application.save();

    console.log('[updateApplicationStatus] Saved successfully:', {
      previousStatus,
      newStatus: status,
    });

    // Get user for email
    const user = await User.findById(application.user);
    const loanType = await LoanType.findById(application.loanType);

    // Create notification for user
    const statusMessages = {
      under_review: 'Your application is under review',
      documents_requested: `Additional documents requested for your application. ${adminNotes || 'Please upload the required documents.'}`,
      approved: 'Congratulations! Your loan application has been approved',
      rejected: `Your loan application has been rejected. ${rejectionReason || 'Contact support for more information.'}`,
      disbursed: 'Your loan has been disbursed to your account',
    };

    await Notification.create({
      user: application.user,
      application: application._id,
      title: `Application ${status.replace('_', ' ').toUpperCase()}`,
      message: statusMessages[status] || 'Application status updated',
      type: status === 'approved' || status === 'disbursed' ? 'success' : status === 'rejected' ? 'error' : 'info',
    });

    // Send email based on status (only documents_requested uses backend Nodemailer)
    // Approved/Rejected emails are handled by EmailJS on the frontend admin panel
    if (user && status === 'documents_requested') {
      try {
        await sendDocumentsRequestedEmail(user, application, adminNotes);
      } catch (emailError) {
        console.error('Failed to send documents requested email:', emailError);
      }
    }

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: `update_status_${status}`,
      entityType: 'application',
      entityId: application._id,
      changes: { 
        previousStatus, 
        newStatus: status, 
        adminNotes, 
        rejectionReason 
      },
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Only allow deletion by owner and only if status is 'submitted'
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application',
      });
    }

    if (application.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete application that is being processed',
      });
    }

    await application.deleteOne();

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate loan agreement PDF
// @route   GET /api/applications/:id/agreement
// @access  Private
exports.generateAgreement = async (req, res, next) => {
  try {
    console.log('[generateAgreement] Request for application ID:', req.params.id);
    
    const application = await LoanApplication.findById(req.params.id)
      .populate('loanType')
      .populate('user');

    if (!application) {
      console.log('[generateAgreement] Application not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.log('[generateAgreement] Found application:', {
      id: application._id,
      applicationNumber: application.applicationNumber,
      status: application.status,
    });

    // Check authorization
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('[generateAgreement] Unauthorized access attempt');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this agreement',
      });
    }

    // Only allow agreement generation for approved applications
    if (application.status !== 'approved' && application.status !== 'disbursed') {
      console.log('[generateAgreement] Invalid status for agreement generation:', application.status);
      return res.status(400).json({
        success: false,
        message: 'Agreement can only be generated for approved loans',
      });
    }

    console.log('[generateAgreement] Starting PDF generation...');
    const pdfBuffer = await generateLoanAgreement(application, application.user, application.loanType);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('[generateAgreement] PDF generation returned empty buffer');
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF - empty buffer returned',
      });
    }

    console.log('[generateAgreement] PDF generated successfully, size:', pdfBuffer.length);
    console.log('[generateAgreement] Sending response, buffer length:', pdfBuffer.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=loan-agreement-${application.applicationNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    console.log('[generateAgreement] Response sent');
  } catch (error) {
    console.error('[generateAgreement] Error:', error);
    next(error);
  }
};

// @desc    Delete application (Admin)
// @route   DELETE /api/applications/admin/:id
// @access  Private/Admin
exports.deleteApplicationAdmin = async (req, res, next) => {
  try {
    console.log('[deleteApplicationAdmin] Request:', {
      applicationId: req.params.id,
      adminId: req.user._id,
      adminRole: req.user.role,
    });

    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      console.log('[deleteApplicationAdmin] Application not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.log('[deleteApplicationAdmin] Found application:', {
      id: application._id,
      applicationNumber: application.applicationNumber,
      userId: application.user,
      status: application.status,
    });

    // Delete associated documents
    const deletedDocuments = await Document.deleteMany({ application: application._id });
    console.log('[deleteApplicationAdmin] Deleted documents:', deletedDocuments.deletedCount);

    // Delete the application
    await application.deleteOne();
    console.log('[deleteApplicationAdmin] Application deleted');

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'delete_application',
      entityType: 'application',
      entityId: application._id,
      changes: {
        deletedApplicationNumber: application.applicationNumber,
        deletedUserId: application.user,
        deletedStatus: application.status,
        documentsDeleted: deletedDocuments.deletedCount,
      },
    });
    console.log('[deleteApplicationAdmin] Audit log created');

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('[deleteApplicationAdmin] ERROR:', {
      error: error.message,
      name: error.name,
    });
    next(error);
  }
};
