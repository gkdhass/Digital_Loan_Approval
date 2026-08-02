const LoanApplication = require('../models/LoanApplication');
const LoanType = require('../models/LoanType');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { generateLoanAgreement } = require('../utils/pdfGenerator');
const {
  sendDocumentsRequestedEmail,
} = require('../utils/emailService');

// @desc    Create loan application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const { loanType, loanAmount, durationMonths, purpose, employmentDetails } = req.body;

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

    const application = await LoanApplication.create({
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
    });

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
    const application = await LoanApplication.findById(req.params.id)
      .populate('loanType')
      .populate('user', 'fullName email phone')
      .populate('reviewedBy', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
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
    const { status, adminNotes, rejectionReason } = req.body;

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const previousStatus = application.status;
    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    
    if (adminNotes) application.adminNotes = adminNotes;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    
    if (status === 'approved') application.approvedAt = Date.now();
    if (status === 'disbursed') application.disbursedAt = Date.now();

    await application.save();

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
    const application = await LoanApplication.findById(req.params.id)
      .populate('loanType')
      .populate('user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this agreement',
      });
    }

    // Only allow agreement generation for approved applications
    if (application.status !== 'approved' && application.status !== 'disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Agreement can only be generated for approved loans',
      });
    }

    const pdfBuffer = await generateLoanAgreement(application, application.user, application.loanType);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=loan-agreement-${application.applicationNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
