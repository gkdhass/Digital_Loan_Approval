const express = require('express');
const router = express.Router();
const {
  getAllLoanTypes,
  getLoanTypeById,
  calculateEMI,
  checkEligibility,
  createLoanType,
  updateLoanType,
} = require('../controllers/loanTypeController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/', getAllLoanTypes);
router.get('/:id', getLoanTypeById);
router.post('/calculate-emi', calculateEMI);
router.post('/check-eligibility', authenticate, checkEligibility);
router.post('/', authenticate, authorizeRole('admin'), createLoanType);
router.put('/:id', authenticate, authorizeRole('admin'), updateLoanType);

module.exports = router;
