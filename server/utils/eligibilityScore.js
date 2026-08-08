/**
 * Eligibility Score Calculator
 * 
 * Calculates a 0-100 eligibility score based on three weighted factors:
 * - Income Factor: 40% weight
 * - Employment Factor: 30% weight
 * - Debt-to-Income Factor: 30% weight
 * 
 * These weights align with the AI risk prediction service to ensure consistency.
 */

/**
 * Calculate eligibility score for loan application
 * 
 * @param {Object} data - Application data
 * @param {number} data.monthlyIncome - Applicant's monthly income
 * @param {number} data.requestedAmount - Loan amount requested
 * @param {string} data.employmentType - Type of employment
 * @param {number} data.existingEMI - Current EMI commitments (default 0)
 * @param {number} data.loanDuration - Loan duration in months
 * @returns {Object} Eligibility assessment with score, stars, and result
 */
function calculateEligibilityScore(data) {
  const {
    monthlyIncome,
    requestedAmount,
    employmentType,
    existingEMI = 0,
    loanDuration,
  } = data;

  // Weight configuration (must sum to 100%)
  const WEIGHTS = {
    income: 0.40,      // 40% - Most important factor
    employment: 0.30,  // 30% - Employment stability
    dti: 0.30,         // 30% - Debt-to-Income ratio
  };

  const scores = {};
  const starRatings = {};
  const reasons = [];

  // ============================================
  // FACTOR 1: INCOME (40% weight)
  // ============================================
  // Calculate annual income to loan ratio
  const annualIncome = monthlyIncome * 12;
  const incomeToLoanRatio = annualIncome / requestedAmount;

  if (incomeToLoanRatio >= 3) {
    scores.income = 100;
    starRatings.income = 5;
  } else if (incomeToLoanRatio >= 2) {
    scores.income = 85;
    starRatings.income = 4;
  } else if (incomeToLoanRatio >= 1.5) {
    scores.income = 70;
    starRatings.income = 3;
  } else if (incomeToLoanRatio >= 1) {
    scores.income = 50;
    starRatings.income = 2;
    reasons.push('Income is borderline for requested loan amount');
  } else {
    scores.income = 25;
    starRatings.income = 1;
    reasons.push('Requested amount exceeds income-based limit');
  }

  // ============================================
  // FACTOR 2: EMPLOYMENT (30% weight)
  // ============================================
  // Employment type stability scores
  const employmentScores = {
    'salaried': { score: 95, stars: 5 },
    'self-employed': { score: 75, stars: 4 },
    'business': { score: 80, stars: 4 },
    'retired': { score: 65, stars: 3 },
    'other': { score: 40, stars: 2 },
  };

  const empType = (employmentType || 'other').toLowerCase();
  const empData = employmentScores[empType] || employmentScores['other'];
  
  scores.employment = empData.score;
  starRatings.employment = empData.stars;

  if (empData.stars <= 2) {
    reasons.push('Employment type requires additional verification');
  }

  // ============================================
  // FACTOR 3: DEBT-TO-INCOME RATIO (30% weight)
  // ============================================
  // Calculate DTI: (Existing EMI / Monthly Income)
  // Lower DTI = better score
  const dtiRatio = existingEMI / monthlyIncome;

  if (dtiRatio <= 0.2) {
    scores.dti = 100;
    starRatings.dti = 5;
  } else if (dtiRatio <= 0.35) {
    scores.dti = 85;
    starRatings.dti = 4;
  } else if (dtiRatio <= 0.5) {
    scores.dti = 65;
    starRatings.dti = 3;
  } else if (dtiRatio <= 0.65) {
    scores.dti = 40;
    starRatings.dti = 2;
    reasons.push('Existing EMI commitments are high');
  } else {
    scores.dti = 20;
    starRatings.dti = 1;
    reasons.push('Existing EMI too high relative to income');
  }

  // ============================================
  // CALCULATE WEIGHTED SCORE
  // ============================================
  const totalScore = 
    scores.income * WEIGHTS.income +
    scores.employment * WEIGHTS.employment +
    scores.dti * WEIGHTS.dti;

  // Round to 2 decimal places
  const finalScore = Math.round(totalScore * 100) / 100;

  // ============================================
  // DETERMINE ELIGIBILITY
  // ============================================
  // Threshold: 60 or above = Eligible
  const ELIGIBILITY_THRESHOLD = 60;
  const isEligible = finalScore >= ELIGIBILITY_THRESHOLD;

  // Build result reason
  let resultReason;
  if (isEligible) {
    if (finalScore >= 80) {
      resultReason = 'Strong financial profile - Highly eligible';
    } else if (finalScore >= 70) {
      resultReason = 'Good financial standing - Eligible for approval';
    } else {
      resultReason = 'Meets minimum eligibility criteria';
    }
  } else {
    // Not eligible - provide specific reason
    if (reasons.length > 0) {
      resultReason = reasons.join(', ');
    } else {
      resultReason = 'Does not meet minimum eligibility criteria';
    }
  }

  // ============================================
  // RETURN COMPLETE ASSESSMENT
  // ============================================
  return {
    score: finalScore,
    isEligible,
    reason: resultReason,
    factors: {
      income: {
        score: Math.round(scores.income),
        stars: starRatings.income,
        label: 'Income vs Loan Amount',
        ratio: incomeToLoanRatio.toFixed(2),
      },
      employment: {
        score: Math.round(scores.employment),
        stars: starRatings.employment,
        label: 'Employment Stability',
        type: employmentType,
      },
      debtToIncome: {
        score: Math.round(scores.dti),
        stars: starRatings.dti,
        label: 'Debt-to-Income Ratio',
        ratio: (dtiRatio * 100).toFixed(1) + '%',
      },
    },
    weights: WEIGHTS,
    threshold: ELIGIBILITY_THRESHOLD,
    calculatedAt: new Date(),
  };
}

/**
 * Convert numeric score to star rating (1-5)
 * 
 * @param {number} score - Score from 0-100
 * @returns {number} Star rating from 1-5
 */
function scoreToStars(score) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

module.exports = {
  calculateEligibilityScore,
  scoreToStars,
};
