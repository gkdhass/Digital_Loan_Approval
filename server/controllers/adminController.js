const User = require('../models/User');
const LoanType = require('../models/LoanType');
const LoanApplication = require('../models/LoanApplication');
const AuditLog = require('../models/AuditLog');
const Document = require('../models/Document');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    // Check if user has active applications
    const activeApplications = await LoanApplication.countDocuments({
      user: user._id,
      status: { $in: ['submitted', 'under_review', 'documents_requested', 'approved'] },
    });

    if (activeApplications > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active applications',
      });
    }

    await user.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'delete_user',
      entityType: 'user',
      entityId: user._id,
      changes: { deletedUser: user.email },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs (Admin)
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, entityType, userId } = req.query;

    const query = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (entityType) query.entityType = entityType;
    if (userId) query.user = userId;

    const logs = await AuditLog.find(query)
      .populate('user', 'fullName email')
      .sort('-timestamp')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create loan type (Admin)
// @route   POST /api/admin/loan-types
// @access  Private/Admin
exports.createLoanType = async (req, res, next) => {
  try {
    const loanType = await LoanType.create(req.body);

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'create_loan_type',
      entityType: 'loan_type',
      entityId: loanType._id,
      changes: { loanType: req.body },
    });

    res.status(201).json({
      success: true,
      message: 'Loan type created successfully',
      data: loanType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan type (Admin)
// @route   PUT /api/admin/loan-types/:id
// @access  Private/Admin
exports.updateLoanType = async (req, res, next) => {
  try {
    const loanType = await LoanType.findById(req.params.id);

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    const previousData = loanType.toObject();
    Object.assign(loanType, req.body);
    await loanType.save();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'update_loan_type',
      entityType: 'loan_type',
      entityId: loanType._id,
      changes: {
        previous: previousData,
        new: req.body,
      },
    });

    res.json({
      success: true,
      message: 'Loan type updated successfully',
      data: loanType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete loan type (Admin)
// @route   DELETE /api/admin/loan-types/:id
// @access  Private/Admin
exports.deleteLoanType = async (req, res, next) => {
  try {
    const loanType = await LoanType.findById(req.params.id);

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    // Check if loan type has active applications
    const activeApplications = await LoanApplication.countDocuments({
      loanType: loanType._id,
      status: { $in: ['submitted', 'under_review', 'documents_requested', 'approved'] },
    });

    if (activeApplications > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete loan type with active applications',
      });
    }

    await loanType.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'delete_loan_type',
      entityType: 'loan_type',
      entityId: loanType._id,
      changes: { deletedLoanType: loanType.name },
    });

    res.json({
      success: true,
      message: 'Loan type deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports (Admin)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const { period = '6m' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Application trends
    const applicationTrends = await LoanApplication.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalApplications: { $sum: 1 },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
          totalAmount: { $sum: '$loanAmount' },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$loanAmount', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Loan type performance
    const loanTypePerformance = await LoanApplication.aggregate([
      {
        $lookup: {
          from: 'loantypes',
          localField: 'loanType',
          foreignField: '_id',
          as: 'loanTypeData',
        },
      },
      { $unwind: '$loanTypeData' },
      {
        $group: {
          _id: '$loanTypeData.name',
          totalApplications: { $sum: 1 },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
          totalAmount: { $sum: '$loanAmount' },
          avgEligibilityScore: { $avg: '$eligibilityScore' },
        },
      },
      {
        $project: {
          _id: 1,
          totalApplications: 1,
          approvedApplications: 1,
          rejectedApplications: 1,
          totalAmount: 1,
          avgEligibilityScore: { $round: ['$avgEligibilityScore', 2] },
          approvalRate: {
            $multiply: [
              { $divide: ['$approvedApplications', '$totalApplications'] },
              100,
            ],
          },
        },
      },
      { $sort: { totalApplications: -1 } },
    ]);

    // Document verification stats
    const documentStats = await Document.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Average processing time
    const processingTimes = await LoanApplication.aggregate([
      {
        $match: {
          status: { $in: ['approved', 'rejected'] },
          reviewedAt: { $exists: true },
        },
      },
      {
        $project: {
          processingDays: {
            $divide: [
              { $subtract: ['$reviewedAt', '$createdAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgProcessingDays: { $avg: '$processingDays' },
          minProcessingDays: { $min: '$processingDays' },
          maxProcessingDays: { $max: '$processingDays' },
        },
      },
    ]);

    // Top users by application count
    const topUsers = await LoanApplication.aggregate([
      {
        $group: {
          _id: '$user',
          applicationCount: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData',
        },
      },
      { $unwind: '$userData' },
      {
        $project: {
          fullName: '$userData.fullName',
          email: '$userData.email',
          applicationCount: 1,
          totalAmount: 1,
        },
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        period,
        applicationTrends,
        loanTypePerformance,
        documentStats: documentStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        processingTimes: processingTimes[0] || {
          avgProcessingDays: 0,
          minProcessingDays: 0,
          maxProcessingDays: 0,
        },
        topUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
