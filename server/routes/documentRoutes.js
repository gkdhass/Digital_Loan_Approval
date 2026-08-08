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

// Multer error handler wrapper
const handleMulterError = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      console.error('[Multer] Upload error:', err.name, err.message);
      console.error('[Multer] Error code:', err.code);
      console.error('[Multer] Field:', err.field);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit',
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name - expected "document"',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }
    next();
  });
};

router.post('/upload', authenticate, handleMulterError, uploadDocument);
router.get('/application/:applicationId', authenticate, getApplicationDocuments);
router.put('/:id/verify', authenticate, authorizeRole('admin'), verifyDocument);
router.delete('/:id', authenticate, deleteDocument);

// AI Assessment routes
router.post('/ai-assessment/:applicationId', authenticate, authorizeRole('admin'), triggerAIAssessment);
router.get('/ai-assessment/:applicationId', authenticate, getAIAssessment);

module.exports = router;
