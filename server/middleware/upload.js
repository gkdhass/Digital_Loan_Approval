const multer = require('multer');
const path = require('path');

// Use memory storage for Vercel serverless compatibility
// Files are stored in memory as Buffer objects instead of disk
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log('[Multer] File filter check:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
  });

  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('[Multer] File accepted');
    return cb(null, true);
  } else {
    console.error('[Multer] File rejected - invalid type');
    cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

module.exports = upload;
