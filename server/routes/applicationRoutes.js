const express = require('express');
const router = express.Router();
const {
  createApplication,
  getUserApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  deleteApplicationAdmin,
  generateAgreement,
} = require('../controllers/applicationController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

router.post('/', authenticate, validationRules.loanApplication, validate, createApplication);
router.get('/', authenticate, getUserApplications);
router.get('/admin/all', authenticate, authorizeRole('admin'), getAllApplications);
router.get('/:id', authenticate, getApplicationById);
router.get('/:id/agreement', authenticate, generateAgreement);
router.put('/:id/status', authenticate, authorizeRole('admin'), updateApplicationStatus);
router.delete('/:id', authenticate, deleteApplication);
router.delete('/admin/:id', authenticate, authorizeRole('admin'), deleteApplicationAdmin);

module.exports = router;
