const OpenAI = require('openai');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const Document = require('../models/Document');
const LoanApplication = require('../models/LoanApplication');

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT) || 30000;

/**
 * Extract text from an image URL using Tesseract OCR
 * Processes images in-memory (no disk writes) for serverless compatibility
 * @param {string} imageUrl - URL of the image to process
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (imageUrl) => {
  try {
    // Download image into memory buffer
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    // Convert to buffer (stays in memory, no disk write)
    const imageBuffer = Buffer.from(response.data);

    // Run OCR directly on the buffer (in-memory processing)
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
        }
      },
    });

    return result.data.text;
  } catch (error) {
    console.error('OCR extraction error:', error.message);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Process multiple documents and extract text
 * @param {Array} documents - Array of document objects
 * @returns {Promise<Object>} - Object with document types and extracted text
 */
const processDocuments = async (documents) => {
  const extractedData = {};

  for (const doc of documents) {
    try {
      // Only process image documents
      if (doc.mimeType && doc.mimeType.startsWith('image/')) {
        console.log(`Processing document: ${doc.fileName} (${doc.documentType})`);
        const text = await extractTextFromImage(doc.fileUrl);
        extractedData[doc.documentType] = {
          text,
          fileName: doc.fileName,
        };
      } else {
        console.log(`Skipping non-image document: ${doc.fileName}`);
        extractedData[doc.documentType] = {
          text: '[Document is not an image - OCR not applicable]',
          fileName: doc.fileName,
        };
      }
    } catch (error) {
      console.error(`Failed to process document ${doc.fileName}:`, error.message);
      extractedData[doc.documentType] = {
        text: `[Failed to extract: ${error.message}]`,
        fileName: doc.fileName,
      };
    }
  }

  return extractedData;
};

/**
 * Call OpenAI to assess loan application
 * @param {Object} application - Loan application data
 * @param {Object} extractedDocuments - Extracted text from documents
 * @returns {Promise<Object>} - AI assessment result
 */
const callOpenAI = async (application, extractedDocuments) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `You are an AI loan assessment assistant. Analyze the following loan application and uploaded documents to provide a risk assessment.

**Application Details:**
- Loan Amount Requested: ₹${application.loanAmount.toLocaleString()}
- Duration: ${application.durationMonths} months
- Monthly EMI: ₹${application.emi.toLocaleString()}
- Purpose: ${application.purpose}
- Employment Type: ${application.employmentDetails.employmentType}
- Company: ${application.employmentDetails.companyName || 'Not provided'}
- Designation: ${application.employmentDetails.designation || 'Not provided'}
- Work Experience: ${application.employmentDetails.workExperienceYears || 'Not provided'} years
- Monthly Income (stated): ₹${application.employmentDetails.monthlyIncome ? application.employmentDetails.monthlyIncome.toLocaleString() : 'Not provided'}
- Rule-Based Eligibility Score: ${application.eligibilityScore || 'Not calculated'}/100

**Uploaded Documents (OCR Extracted):**
${JSON.stringify(extractedDocuments, null, 2)}

**Your Task:**
1. Analyze if the stated monthly income matches what appears in the salary slip or bank statement
2. Check for any red flags or inconsistencies in the documents
3. Evaluate the overall risk based on income, loan amount, EMI burden, and employment stability
4. Consider the rule-based eligibility score as additional context

**Respond ONLY with valid JSON in this exact format:**
{
  "aiConfidenceScore": <number 0-100>,
  "aiRecommendation": "<Likely Approved | Likely Rejected | Needs Review>",
  "aiReasoning": "<2-3 sentence explanation of your assessment>",
  "flaggedInconsistencies": ["<inconsistency 1>", "<inconsistency 2>"]
}

**Important:**
- If stated income significantly differs from salary slip, flag it
- If documents are unclear or unreadable, mark as "Needs Review"
- Consider EMI-to-income ratio (EMI should ideally be <40% of monthly income)
- Be specific in flaggedInconsistencies array (can be empty if none found)`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a loan risk assessment AI. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code block if present
    let jsonContent = content;
    if (content.startsWith('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (content.startsWith('```')) {
      jsonContent = content.replace(/```\n?/g, '').trim();
    }

    const assessment = JSON.parse(jsonContent);

    // Validate response structure
    if (
      typeof assessment.aiConfidenceScore !== 'number' ||
      !['Likely Approved', 'Likely Rejected', 'Needs Review'].includes(assessment.aiRecommendation) ||
      typeof assessment.aiReasoning !== 'string' ||
      !Array.isArray(assessment.flaggedInconsistencies)
    ) {
      throw new Error('Invalid AI response structure');
    }

    return assessment;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('OpenAI request timed out');
    }
    throw error;
  }
};

/**
 * Generate AI assessment for a loan application
 * @param {string} applicationId - Loan application ID
 * @returns {Promise<Object>} - AI assessment result
 */
const generateAIAssessment = async (applicationId) => {
  try {
    console.log(`Starting AI assessment for application ${applicationId}`);

    // Fetch application with related data
    const application = await LoanApplication.findById(applicationId)
      .populate('user')
      .populate('loanType');

    if (!application) {
      throw new Error('Application not found');
    }

    // Fetch uploaded documents
    const documents = await Document.find({
      application: applicationId,
      verificationStatus: { $ne: 'rejected' }, // Only process non-rejected documents
    });

    if (documents.length === 0) {
      console.log('No documents uploaded yet - marking as not_available');
      return {
        status: 'not_available',
        message: 'No documents available for AI assessment',
      };
    }

    // Extract text from documents
    console.log(`Processing ${documents.length} documents for OCR...`);
    const extractedDocuments = await processDocuments(documents);

    // Call OpenAI for assessment
    console.log('Calling OpenAI for assessment...');
    const aiResult = await callOpenAI(application, extractedDocuments);

    // Update application with AI assessment
    application.aiAssessment = {
      ...aiResult,
      processedAt: new Date(),
      status: 'completed',
    };

    await application.save();

    console.log(`AI assessment completed successfully for application ${applicationId}`);
    return {
      status: 'completed',
      assessment: aiResult,
    };
  } catch (error) {
    console.error(`AI assessment failed for application ${applicationId}:`, error.message);

    // Update application with error status
    try {
      const application = await LoanApplication.findById(applicationId);
      if (application) {
        application.aiAssessment = {
          status: 'failed',
          errorMessage: error.message,
          processedAt: new Date(),
        };
        await application.save();
      }
    } catch (updateError) {
      console.error('Failed to update application with error status:', updateError.message);
    }

    return {
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Trigger AI assessment asynchronously (non-blocking)
 * @param {string} applicationId - Loan application ID
 */
const triggerAIAssessmentAsync = (applicationId) => {
  // Run in background without blocking
  generateAIAssessment(applicationId).catch((error) => {
    console.error(`Background AI assessment failed for ${applicationId}:`, error.message);
  });
};

module.exports = {
  generateAIAssessment,
  triggerAIAssessmentAsync,
  extractTextFromImage,
};
