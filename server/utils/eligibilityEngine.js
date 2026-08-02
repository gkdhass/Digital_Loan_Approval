/**
 * Eligibility Engine for Loan Applications
 * Evaluates user eligibility based on multiple factors
 */

class EligibilityEngine {
  constructor(loanType, userData, applicationData) {
    this.loanType = loanType;
    this.userData = userData;
    this.applicationData = applicationData;
    this.score = 0;
    this.maxScore = 100;
    this.reasons = [];
    this.passingReasons = [];
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Check age eligibility
   * - Minimum age: 21 years
   * - Maximum age: 65 years at loan maturity
   */
  checkAge() {
    const age = this.calculateAge(this.userData.dateOfBirth);
    
    if (!age) {
      this.reasons.push('Date of birth is required for eligibility check');
      return 0;
    }

    if (age < 21) {
      this.reasons.push(`Minimum age requirement is 21 years (current age: ${age})`);
      return 0;
    }

    const ageAtMaturity = age + (this.applicationData.durationMonths / 12);
    if (ageAtMaturity > 65) {
      this.reasons.push(`Loan maturity age (${Math.floor(ageAtMaturity)}) exceeds maximum limit of 65 years`);
      return 0;
    }

    this.passingReasons.push(`Age requirement met (${age} years)`);
    return 15;
  }

  /**
   * Check income eligibility
   * - Minimum income as per loan type
   * - Income stability based on employment type
   */
  checkIncome() {
    const monthlyIncome = this.applicationData.monthlyIncome || this.userData.monthlyIncome;
    
    if (!monthlyIncome) {
      this.reasons.push('Monthly income information is required');
      return 0;
    }

    // Check minimum income requirement
    if (monthlyIncome < this.loanType.minIncome) {
      this.reasons.push(
        `Minimum monthly income of ₹${this.loanType.minIncome.toLocaleString()} required ` +
        `(current: ₹${monthlyIncome.toLocaleString()})`
      );
      return 0;
    }

    // Income stability bonus based on employment type
    const employmentType = this.applicationData.employmentType || this.userData.employmentType;
    let stabilityBonus = 0;

    switch (employmentType) {
      case 'salaried':
        stabilityBonus = 5;
        this.passingReasons.push('Salaried employment provides income stability');
        break;
      case 'self-employed':
        stabilityBonus = 3;
        this.passingReasons.push('Self-employed with stable income');
        break;
      case 'business':
        stabilityBonus = 2;
        this.passingReasons.push('Business owner with income verification');
        break;
      default:
        this.passingReasons.push('Income source verified');
    }

    this.passingReasons.push(`Income requirement met (₹${monthlyIncome.toLocaleString()}/month)`);
    return 25 + stabilityBonus;
  }

  /**
   * Check loan amount eligibility
   * - Within loan type limits
   * - Reasonable debt-to-income ratio
   */
  checkLoanAmount() {
    const loanAmount = this.applicationData.loanAmount;
    const monthlyIncome = this.applicationData.monthlyIncome || this.userData.monthlyIncome;

    if (!loanAmount) {
      this.reasons.push('Loan amount is required');
      return 0;
    }

    // Check maximum amount
    if (loanAmount > this.loanType.maxAmount) {
      this.reasons.push(
        `Maximum loan amount for ${this.loanType.name} is ₹${this.loanType.maxAmount.toLocaleString()} ` +
        `(requested: ₹${loanAmount.toLocaleString()})`
      );
      return 0;
    }

    // Check minimum reasonable amount (should be at least 3x monthly income)
    const minReasonableAmount = monthlyIncome * 3;
    if (loanAmount < minReasonableAmount) {
      this.reasons.push(
        `Requested loan amount (₹${loanAmount.toLocaleString()}) is too low relative to income`
      );
      return 5;
    }

    this.passingReasons.push(`Loan amount within acceptable limits (₹${loanAmount.toLocaleString()})`);
    return 20;
  }

  /**
   * Check EMI to income ratio
   * - EMI should not exceed 50% of monthly income
   * - Preferred ratio is below 40%
   */
  checkEMIRatio() {
    const loanAmount = this.applicationData.loanAmount;
    const durationMonths = this.applicationData.durationMonths;
    const monthlyIncome = this.applicationData.monthlyIncome || this.userData.monthlyIncome;

    if (!loanAmount || !durationMonths || !monthlyIncome) {
      this.reasons.push('Incomplete information for EMI ratio calculation');
      return 0;
    }

    // Calculate EMI
    const monthlyRate = this.loanType.interestRate / 12 / 100;
    const emi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1)
    );

    const emiRatio = (emi / monthlyIncome) * 100;

    if (emiRatio > 50) {
      this.reasons.push(
        `EMI (₹${emi.toLocaleString()}) exceeds 50% of monthly income ` +
        `(ratio: ${emiRatio.toFixed(1)}%)`
      );
      return 0;
    }

    if (emiRatio > 40) {
      this.passingReasons.push(
        `EMI ratio acceptable (${emiRatio.toFixed(1)}% of monthly income)`
      );
      return 15;
    }

    this.passingReasons.push(
      `EMI ratio comfortable (${emiRatio.toFixed(1)}% of monthly income)`
    );
    return 20;
  }

  /**
   * Check employment stability
   * - Work experience requirements
   * - Company stability indicators
   */
  checkEmployment() {
    const employmentDetails = this.applicationData.employmentDetails || {};
    const workExperience = employmentDetails.workExperienceYears || 0;
    const employmentType = employmentDetails.employmentType || this.userData.employmentType;

    if (!employmentType) {
      this.reasons.push('Employment type information is required');
      return 0;
    }

    let score = 0;

    // Work experience check
    if (workExperience < 1) {
      this.reasons.push('Minimum 1 year of work experience required');
      score = 0;
    } else if (workExperience < 2) {
      this.passingReasons.push('Work experience meets minimum requirement');
      score = 5;
    } else if (workExperience < 5) {
      this.passingReasons.push('Good work experience (2-5 years)');
      score = 10;
    } else {
      this.passingReasons.push('Strong work experience (5+ years)');
      score = 15;
    }

    // Employment type stability
    if (employmentType === 'salaried') {
      this.passingReasons.push('Salaried employment indicates stable income');
      score += 5;
    } else if (employmentType === 'self-employed' || employmentType === 'business') {
      this.passingReasons.push('Self-employment/business ownership with documented income');
      score += 3;
    }

    return Math.min(score, 20);
  }

  /**
   * Check duration eligibility
   * - Within loan type limits
   * - Reasonable repayment period
   */
  checkDuration() {
    const durationMonths = this.applicationData.durationMonths;

    if (!durationMonths) {
      this.reasons.push('Loan duration is required');
      return 0;
    }

    if (durationMonths > this.loanType.maxDurationMonths) {
      this.reasons.push(
        `Maximum duration for ${this.loanType.name} is ${this.loanType.maxDurationMonths} months ` +
        `(requested: ${durationMonths} months)`
      );
      return 0;
    }

    if (durationMonths < 12) {
      this.reasons.push('Minimum loan duration is 12 months');
      return 0;
    }

    this.passingReasons.push(`Loan duration within acceptable limits (${durationMonths} months)`);
    return 10;
  }

  /**
   * Run all eligibility checks
   */
  evaluate() {
    this.score = 0;

    // Run all checks
    this.score += this.checkAge();
    this.score += this.checkIncome();
    this.score += this.checkLoanAmount();
    this.score += this.checkEMIRatio();
    this.score += this.checkEmployment();
    this.score += this.checkDuration();

    // Ensure score doesn't exceed maximum
    this.score = Math.min(this.score, this.maxScore);

    const isEligible = this.score >= 70;

    return {
      isEligible,
      score: this.score,
      maxScore: this.maxScore,
      percentage: Math.round((this.score / this.maxScore) * 100),
      reasons: isEligible ? this.passingReasons : this.reasons,
      details: {
        age: this.calculateAge(this.userData.dateOfBirth),
        monthlyIncome: this.applicationData.monthlyIncome || this.userData.monthlyIncome,
        loanAmount: this.applicationData.loanAmount,
        emi: this.calculateEMI(),
        emiRatio: this.calculateEMIRatio(),
        employmentType: this.applicationData.employmentType || this.userData.employmentType,
        workExperience: this.applicationData.employmentDetails?.workExperienceYears,
        durationMonths: this.applicationData.durationMonths
      }
    };
  }

  /**
   * Helper: Calculate EMI
   */
  calculateEMI() {
    const loanAmount = this.applicationData.loanAmount;
    const durationMonths = this.applicationData.durationMonths;
    
    if (!loanAmount || !durationMonths) return 0;

    const monthlyRate = this.loanType.interestRate / 12 / 100;
    return Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1)
    );
  }

  /**
   * Helper: Calculate EMI ratio
   */
  calculateEMIRatio() {
    const emi = this.calculateEMI();
    const monthlyIncome = this.applicationData.monthlyIncome || this.userData.monthlyIncome;
    
    if (!emi || !monthlyIncome) return 0;
    return (emi / monthlyIncome) * 100;
  }
}

/**
 * Factory function to create and run eligibility check
 */
const checkEligibility = (loanType, userData, applicationData) => {
  const engine = new EligibilityEngine(loanType, userData, applicationData);
  return engine.evaluate();
};

module.exports = { EligibilityEngine, checkEligibility };
