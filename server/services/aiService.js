const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Call AI service to predict loan risk
 * @param {Object} applicationData - Loan application data
 * @returns {Promise<Object>} Risk assessment result
 */
async function predictLoanRisk(applicationData) {
  try {
    const payload = {
      monthlyIncome: applicationData.monthlyIncome,
      annualIncome: applicationData.annualIncome || applicationData.monthlyIncome * 12,
      employmentType: applicationData.employmentType,
      existingEMI: applicationData.existingEMI || 0,
      requestedAmount: applicationData.requestedAmount,
      loanDuration: applicationData.loanDuration,
      age: applicationData.age || 30, // Default age if not provided
    };

    console.log('📊 Calling AI service for risk prediction...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${AI_SERVICE_URL}/predict-risk`,
      payload,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.success) {
      console.log('✅ AI risk prediction successful');
      console.log(`Risk Level: ${response.data.data.riskLevel}, Recommendation: ${response.data.data.recommendation}`);
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    console.error('❌ AI service error:', error.message);
    
    // Return graceful fallback - don't block loan application
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: {
        approvalProbability: null,
        riskLevel: null,
        recommendation: null,
        status: 'pending',
        errorMessage: 'AI risk assessment unavailable - will be processed manually',
      },
    };
  }
}

/**
 * Check if AI service is healthy
 * @returns {Promise<boolean>}
 */
async function checkAIServiceHealth() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.warn('AI service health check failed:', error.message);
    return false;
  }
}

module.exports = {
  predictLoanRisk,
  checkAIServiceHealth,
};
