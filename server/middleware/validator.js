const { body, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules
const validationRules = {
  register: [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
  ],
  
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  
  loanApplication: [
    body('loanType').notEmpty().withMessage('Loan type is required'),
    body('loanAmount').isNumeric().isFloat({ min: 1 }).withMessage('Valid loan amount is required'),
    body('durationMonths').isInt({ min: 1 }).withMessage('Valid duration is required'),
    body('purpose').trim().notEmpty().withMessage('Loan purpose is required'),
  ],
  
  updateProfile: [
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
};

module.exports = { validate, validationRules };
