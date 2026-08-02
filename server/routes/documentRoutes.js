const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getApplicationDocuments,
  verifyDocument,
  deleteDocument,
  triggerAIAssessment,
  getAIAssessment,
} = require('../controllers/documentController');
const { authenticate, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, upload.single('document'), uploadDocument);
router.get('/application/:applicationId', authenticate, getApplicationDocuments);
router.put('/:id/verify', authenticate, authorizeRole('admin'), verifyDocument);
router.delete('/:id', authenticate, deleteDocument);

// AI Assessment routes
router.post('/ai-assessment/:applicationId', authenticate, authorizeRole('admin'), triggerAIAssessment);
router.get('/ai-assessment/:applicationId', authenticate, getAIAssessment);

module.exports = router;
