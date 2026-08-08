const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAuditLogs,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  getReports,
  exportReports,
} = require('../controllers/adminController');
const { authenticate, authorizeRole } = require('../middleware/auth');

// User management
router.get('/users', authenticate, authorizeRole('admin'), getAllUsers);
router.delete('/users/:id', authenticate, authorizeRole('admin'), deleteUser);

// Audit logs
router.get('/audit-logs', authenticate, authorizeRole('admin'), getAuditLogs);

// Loan type management
router.post('/loan-types', authenticate, authorizeRole('admin'), createLoanType);
router.put('/loan-types/:id', authenticate, authorizeRole('admin'), updateLoanType);
router.delete('/loan-types/:id', authenticate, authorizeRole('admin'), deleteLoanType);

// Reports
router.get('/reports', authenticate, authorizeRole('admin'), getReports);
router.get('/reports/export', authenticate, authorizeRole('admin'), exportReports);

module.exports = router;
