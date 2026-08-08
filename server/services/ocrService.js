const axios = require('axios');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Call AI service to perform OCR verification on document
 * @param {Buffer} fileBuffer - Document image buffer
 * @param {string} fileName - Original file name
 * @param {string} documentType - 'pan' or 'aadhaar'
 * @param {string} registeredName - Customer's registered name for comparison
 * @returns {Promise<Object>} OCR verification result
 */
async function verifyDocumentOCR(fileBuffer, fileName, documentType, registeredName) {
  try {
    // Normalize document type for AI service
    let ocrDocType;
    const docTypeLower = documentType.toLowerCase();
    
    if (docTypeLower.includes('pan')) {
      ocrDocType = 'pan';
    } else if (docTypeLower.includes('aadhar') || docTypeLower.includes('aadhaar')) {
      ocrDocType = 'aadhaar';
    } else {
      // Not a PAN or Aadhaar document - skip OCR
      return {
        success: false,
        skip: true,
        message: 'OCR not applicable for this document type',
      };
    }

    console.log(`📄 Calling AI service for OCR verification: ${ocrDocType} document`);
    console.log(`   File: ${fileName}`);
    console.log(`   Registered Name: ${registeredName}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'image/jpeg', // Cloudinary converts to JPEG
    });
    formData.append('documentType', ocrDocType);
    formData.append('registeredName', registeredName);

    // Call OCR endpoint
    const response = await axios.post(
      `${AI_SERVICE_URL}/ocr-verify`,
      formData,
      {
        timeout: 30000, // 30 second timeout for OCR processing
        headers: formData.getHeaders(),
      }
    );

    if (response.data && response.data.success) {
      console.log('✅ OCR verification successful');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Confidence: ${response.data.data?.confidence || 'N/A'}`);
      
      return {
        success: true,
        data: {
          extractedName: response.data.data.extractedName,
          extractedPAN: response.data.data.extractedPAN,
          extractedAadhaar: response.data.data.extractedAadhaar,
          nameMismatch: response.data.data.nameMismatch,
          nameSimilarity: response.data.data.nameSimilarity,
          invalidPAN: response.data.data.invalidPAN,
          invalidAadhaar: response.data.data.invalidAadhaar,
          confidence: response.data.data.confidence,
          ocrStatus: response.data.status === 'unreadable' ? 'unreadable' : 'processed',
          rawText: response.data.data.rawText,
          processedAt: new Date(),
        },
      };
    } else if (response.data && response.data.status === 'unreadable') {
      // Image was unreadable
      console.log('⚠️  OCR verification: Image unreadable');
      return {
        success: true,
        data: {
          ocrStatus: 'unreadable',
          processedAt: new Date(),
        },
      };
    } else {
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    console.error('❌ OCR service error:', error.message);
    
    // Check if it's a "skip" case
    if (error.skip) {
      return error;
    }
    
    // Return graceful fallback - don't block document upload
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: {
        ocrStatus: 'failed',
        processedAt: new Date(),
      },
    };
  }
}

/**
 * Check if AI service OCR endpoint is healthy
 * @returns {Promise<boolean>}
 */
async function checkOCRServiceHealth() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.warn('OCR service health check failed:', error.message);
    return false;
  }
}

/**
 * Determine if document type requires OCR verification
 * @param {string} documentType - Document type from upload
 * @returns {boolean}
 */
function requiresOCR(documentType) {
  const docTypeLower = documentType.toLowerCase();
  return (
    docTypeLower.includes('pan') || 
    docTypeLower.includes('aadhar') || 
    docTypeLower.includes('aadhaar')
  );
}

module.exports = {
  verifyDocumentOCR,
  checkOCRServiceHealth,
  requiresOCR,
};
