const express = require('express');
const router = express.Router();
const {
  getCustomerDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/customer', authenticate, getCustomerDashboard);
router.get('/admin', authenticate, authorizeRole('admin'), getAdminDashboard);

module.exports = router;
