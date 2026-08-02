const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getAdminDashboard,
  getAnalytics,
} = require('../controllers/dashboardController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/user', authenticate, getUserDashboard);
router.get('/admin', authenticate, authorizeRole('admin'), getAdminDashboard);
router.get('/analytics', authenticate, authorizeRole('admin'), getAnalytics);

module.exports = router;
