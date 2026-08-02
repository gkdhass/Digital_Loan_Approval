const LoanApplication = require('../models/LoanApplication');
const User = require('../models/User');
const Document = require('../models/Document');
const Notification = require('../models/Notification');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Total applications
    const totalApplications = await LoanApplication.countDocuments({ user: userId });

    // Applications by status
    const applicationsByStatus = await LoanApplication.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent applications
    const recentApplications = await LoanApplication.find({ user: userId })
      .populate('loanType', 'name icon')
      .sort('-createdAt')
      .limit(5);

    // Total loan amount requested and approved
    const loanStats = await LoanApplication.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalRequested: { $sum: '$loanAmount' },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$loanAmount', 0] }
          },
          totalEMI: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$emi', 0] }
          }
        }
      }
    ]);

    // Pending documents
    const pendingDocuments = await Document.countDocuments({
      user: userId,
      status: 'pending'
    });

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalApplications,
          pendingApplications: applicationsByStatus.find(s => s._id === 'submitted')?.count || 0,
          approvedApplications: applicationsByStatus.find(s => s._id === 'approved')?.count || 0,
          rejectedApplications: applicationsByStatus.find(s => s._id === 'rejected')?.count || 0,
          pendingDocuments,
          unreadNotifications
        },
        loanStats: loanStats[0] || {
          totalRequested: 0,
          totalApproved: 0,
          totalEMI: 0
        },
        applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Total counts
    const totalApplications = await LoanApplication.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const pendingApplications = await LoanApplication.countDocuments({ status: 'submitted' });
    const pendingDocuments = await Document.countDocuments({ status: 'pending' });

    // Applications by status
    const applicationsByStatus = await LoanApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total loan amounts
    const loanStats = await LoanApplication.aggregate([
      {
        $group: {
          _id: null,
          totalRequested: { $sum: '$loanAmount' },
          totalApproved: {
            $sum: { $cond: [{ $in: ['$status', ['approved', 'disbursed']] }, '$loanAmount', 0] }
          },
          totalDisbursed: {
            $sum: { $cond: [{ $eq: ['$status', 'disbursed'] }, '$loanAmount', 0] }
          }
        }
      }
    ]);

    // Recent applications
    const recentApplications = await LoanApplication.find()
      .populate('user', 'fullName email')
      .populate('loanType', 'name')
      .sort('-createdAt')
      .limit(10);

    // Applications by loan type
    const applicationsByLoanType = await LoanApplication.aggregate([
      {
        $lookup: {
          from: 'loantypes',
          localField: 'loanType',
          foreignField: '_id',
          as: 'loanTypeData'
        }
      },
      { $unwind: '$loanTypeData' },
      {
        $group: {
          _id: '$loanTypeData.name',
          count: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await LoanApplication.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalApplications,
          totalUsers,
          pendingApplications,
          pendingDocuments,
          approvedApplications: applicationsByStatus.find(s => s._id === 'approved')?.count || 0,
          rejectedApplications: applicationsByStatus.find(s => s._id === 'rejected')?.count || 0
        },
        loanStats: loanStats[0] || {
          totalRequested: 0,
          totalApproved: 0,
          totalDisbursed: 0
        },
        applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        applicationsByLoanType,
        monthlyTrends,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data for charts
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
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

    // Time series data
    const timeSeriesData = await LoanApplication.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          applications: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Approval rate by loan type
    const approvalRateByType = await LoanApplication.aggregate([
      {
        $lookup: {
          from: 'loantypes',
          localField: 'loanType',
          foreignField: '_id',
          as: 'loanTypeData'
        }
      },
      { $unwind: '$loanTypeData' },
      {
        $group: {
          _id: '$loanTypeData.name',
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 1,
          total: 1,
          approved: 1,
          rejected: 1,
          approvalRate: {
            $multiply: [
              { $divide: ['$approved', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeSeriesData,
        approvalRateByType
      }
    });
  } catch (error) {
    next(error);
  }
};
