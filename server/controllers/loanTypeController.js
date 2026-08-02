const LoanType = require('../models/LoanType');

// @desc    Get all loan types
// @route   GET /api/loan-types
// @access  Public
exports.getAllLoanTypes = async (req, res, next) => {
  try {
    const loanTypes = await LoanType.find({ isActive: true }).sort('name');

    res.json({
      success: true,
      count: loanTypes.length,
      data: loanTypes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan type by ID
// @route   GET /api/loan-types/:id
// @access  Public
exports.getLoanTypeById = async (req, res, next) => {
  try {
    const loanType = await LoanType.findById(req.params.id);

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    res.json({
      success: true,
      data: loanType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate EMI
// @route   POST /api/loan-types/calculate-emi
// @access  Public
exports.calculateEMI = async (req, res, next) => {
  try {
    const { principal, interestRate, durationMonths } = req.body;

    if (!principal || !interestRate || !durationMonths) {
      return res.status(400).json({
        success: false,
        message: 'Principal, interest rate, and duration are required',
      });
    }

    const monthlyRate = interestRate / 12 / 100;
    const emi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1)
    );

    const totalPayable = emi * durationMonths;
    const interestAmount = totalPayable - principal;

    res.json({
      success: true,
      data: {
        emi,
        totalPayable,
        interestAmount,
        principal,
        interestRate,
        durationMonths,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check eligibility
// @route   POST /api/loan-types/check-eligibility
// @access  Private
exports.checkEligibility = async (req, res, next) => {
  try {
    const { loanTypeId, loanAmount, monthlyIncome } = req.body;

    const loanType = await LoanType.findById(loanTypeId);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    let score = 0;
    const reasons = [];

    // Check minimum income
    if (monthlyIncome >= loanType.minIncome) {
      score += 40;
    } else {
      reasons.push(`Minimum monthly income of ₹${loanType.minIncome.toLocaleString()} required`);
    }

    // Check loan amount
    if (loanAmount <= loanType.maxAmount) {
      score += 30;
    } else {
      reasons.push(`Maximum loan amount is ₹${loanType.maxAmount.toLocaleString()}`);
    }

    // EMI to income ratio (should be < 50%)
    const monthlyRate = loanType.interestRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 12)) /
                (Math.pow(1 + monthlyRate, 12) - 1);
    const emiRatio = (emi / monthlyIncome) * 100;

    if (emiRatio < 50) {
      score += 30;
    } else {
      reasons.push('EMI exceeds 50% of monthly income');
    }

    const isEligible = score >= 70;

    res.json({
      success: true,
      data: {
        isEligible,
        score,
        reasons: isEligible ? ['You meet the eligibility criteria'] : reasons,
        loanType: loanType.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create loan type (Admin only)
// @route   POST /api/loan-types
// @access  Private/Admin
exports.createLoanType = async (req, res, next) => {
  try {
    const loanType = await LoanType.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Loan type created successfully',
      data: loanType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan type (Admin only)
// @route   PUT /api/loan-types/:id
// @access  Private/Admin
exports.updateLoanType = async (req, res, next) => {
  try {
    const loanType = await LoanType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found',
      });
    }

    res.json({
      success: true,
      message: 'Loan type updated successfully',
      data: loanType,
    });
  } catch (error) {
    next(error);
  }
};
