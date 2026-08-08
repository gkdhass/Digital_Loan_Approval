"""
Digital Loan Approval - AI Risk Prediction Service
Flask-based microservice for loan risk assessment and OCR document verification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import logging
import re
import os

# OCR imports
try:
    import pytesseract
    from PIL import Image
    import io
    from rapidfuzz import fuzz
    OCR_AVAILABLE = True
except ImportError as e:
    OCR_AVAILABLE = False
    logging.warning(f"OCR dependencies not available: {e}")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LoanRiskPredictor:
    """
    Loan Risk Prediction using rules-based scoring
    
    NOTE: This is a rules-based approach that mimics ML model output.
    It can be replaced with a trained scikit-learn model later without
    changing the API interface.
    
    Scoring Weights:
    - Income to Loan Ratio: 30%
    - Employment Stability: 25%
    - Debt-to-Income Ratio: 25%
    - Loan Duration Risk: 15%
    - Age Factor: 5%
    """
    
    def __init__(self):
        self.weights = {
            'income_ratio': 0.30,
            'employment': 0.25,
            'dti': 0.25,
            'duration': 0.15,
            'age': 0.05
        }
    
    def predict(self, data):
        """
        Predict loan approval risk
        
        Args:
            data (dict): Application data with fields:
                - monthlyIncome (float)
                - annualIncome (float)
                - employmentType (str)
                - existingEMI (float)
                - requestedAmount (float)
                - loanDuration (int) - in months
                - age (int)
        
        Returns:
            dict: {
                approvalProbability: float (0-100),
                riskLevel: str ("Low"|"Medium"|"High"),
                recommendation: str ("Approve"|"Review"|"Reject"),
                factors: dict - breakdown of contributing factors
            }
        """
        try:
            # Extract features
            monthly_income = float(data.get('monthlyIncome', 0))
            annual_income = float(data.get('annualIncome', monthly_income * 12))
            employment_type = data.get('employmentType', 'other')
            existing_emi = float(data.get('existingEMI', 0))
            requested_amount = float(data.get('requestedAmount', 0))
            loan_duration = int(data.get('loanDuration', 12))
            age = int(data.get('age', 30))
            
            # Calculate individual factor scores (0-100)
            scores = {}
            
            # 1. Income to Loan Ratio Score (30% weight)
            # Higher income relative to loan = better score
            if monthly_income > 0:
                income_loan_ratio = (monthly_income * 12) / max(requested_amount, 1)
                if income_loan_ratio >= 3:
                    scores['income_ratio'] = 100
                elif income_loan_ratio >= 2:
                    scores['income_ratio'] = 80
                elif income_loan_ratio >= 1:
                    scores['income_ratio'] = 60
                elif income_loan_ratio >= 0.5:
                    scores['income_ratio'] = 40
                else:
                    scores['income_ratio'] = 20
            else:
                scores['income_ratio'] = 0
            
            # 2. Employment Stability Score (25% weight)
            employment_scores = {
                'salaried': 90,
                'self-employed': 70,
                'business': 75,
                'retired': 60,
                'other': 40
            }
            scores['employment'] = employment_scores.get(employment_type.lower(), 40)
            
            # 3. Debt-to-Income Ratio Score (25% weight)
            # Lower DTI = better score
            if monthly_income > 0:
                dti_ratio = existing_emi / monthly_income
                if dti_ratio <= 0.2:
                    scores['dti'] = 100
                elif dti_ratio <= 0.35:
                    scores['dti'] = 80
                elif dti_ratio <= 0.5:
                    scores['dti'] = 60
                elif dti_ratio <= 0.65:
                    scores['dti'] = 40
                else:
                    scores['dti'] = 20
            else:
                scores['dti'] = 0
            
            # 4. Loan Duration Risk Score (15% weight)
            # Shorter duration = lower risk = better score
            if loan_duration <= 12:
                scores['duration'] = 100
            elif loan_duration <= 24:
                scores['duration'] = 85
            elif loan_duration <= 36:
                scores['duration'] = 70
            elif loan_duration <= 60:
                scores['duration'] = 55
            else:
                scores['duration'] = 40
            
            # 5. Age Factor Score (5% weight)
            # Prime working age (25-55) = best score
            if 25 <= age <= 55:
                scores['age'] = 100
            elif 18 <= age < 25:
                scores['age'] = 70
            elif 55 < age <= 65:
                scores['age'] = 80
            else:
                scores['age'] = 50
            
            # Calculate weighted approval probability
            approval_probability = sum(
                scores[factor] * self.weights[factor]
                for factor in scores
            )
            
            # Determine risk level
            if approval_probability >= 75:
                risk_level = "Low"
                recommendation = "Approve"
            elif approval_probability >= 55:
                risk_level = "Medium"
                recommendation = "Review"
            else:
                risk_level = "High"
                recommendation = "Reject"
            
            # Add some randomness to simulate ML model variability (±5%)
            noise = np.random.uniform(-5, 5)
            approval_probability = np.clip(approval_probability + noise, 0, 100)
            
            return {
                'approvalProbability': round(approval_probability, 2),
                'riskLevel': risk_level,
                'recommendation': recommendation,
                'factors': {
                    'incomeToLoanRatio': round(scores['income_ratio'], 2),
                    'employmentStability': round(scores['employment'], 2),
                    'debtToIncomeRatio': round(scores['dti'], 2),
                    'loanDurationRisk': round(scores['duration'], 2),
                    'ageFactor': round(scores['age'], 2)
                },
                'metadata': {
                    'assessedAt': datetime.utcnow().isoformat(),
                    'modelVersion': 'rules-based-v1.0',
                    'note': 'This is a rules-based assessment that can be replaced with ML model'
                }
            }
            
        except Exception as e:
            logger.error(f"Error in risk prediction: {str(e)}")
            raise


# Initialize predictor
predictor = LoanRiskPredictor()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ai-risk-prediction',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    """
    Predict loan approval risk
    
    Request Body:
        {
            "monthlyIncome": float,
            "annualIncome": float (optional, calculated from monthly if not provided),
            "employmentType": str,
            "existingEMI": float,
            "requestedAmount": float,
            "loanDuration": int,
            "age": int
        }
    
    Response:
        {
            "success": true,
            "data": {
                "approvalProbability": float (0-100),
                "riskLevel": str ("Low"|"Medium"|"High"),
                "recommendation": str ("Approve"|"Review"|"Reject"),
                "factors": {...},
                "metadata": {...}
            }
        }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['monthlyIncome', 'employmentType', 'requestedAmount', 'loanDuration']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Predict risk
        logger.info(f"Predicting risk for loan amount: {data.get('requestedAmount')}")
        prediction = predictor.predict(data)
        
        logger.info(f"Risk prediction result: {prediction['riskLevel']} - {prediction['recommendation']}")
        
        return jsonify({
            'success': True,
            'data': prediction
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Invalid data format: {str(e)}'
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in predict_risk: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during risk prediction'
        }), 500


class OCRDocumentVerifier:
    """
    OCR-based document verification for Aadhaar and PAN cards
    
    Uses Tesseract OCR to extract text from document images and validate formats.
    Includes fuzzy name matching to handle OCR inaccuracies.
    """
    
    # Regex patterns for document validation
    PAN_PATTERN = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
    AADHAAR_PATTERN = re.compile(r'^\d{12}$')
    
    def __init__(self):
        if not OCR_AVAILABLE:
            logger.warning("OCR dependencies not available. OCR verification will be disabled.")
    
    def extract_text_from_image(self, image_file):
        """
        Extract text from image using Tesseract OCR
        
        Args:
            image_file: File-like object containing image data
            
        Returns:
            str: Extracted text
        """
        try:
            # Open image
            image = Image.open(image_file)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(image, lang='eng')
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise
    
    def extract_pan_number(self, text):
        """
        Extract PAN number from text using regex
        
        Args:
            text (str): OCR extracted text
            
        Returns:
            str or None: PAN number if found
        """
        # Remove whitespace and convert to uppercase
        cleaned_text = text.upper().replace(' ', '').replace('\n', '')
        
        # Search for PAN pattern
        for word in re.findall(r'[A-Z0-9]{10}', cleaned_text):
            if self.PAN_PATTERN.match(word):
                return word
        
        return None
    
    def extract_aadhaar_number(self, text):
        """
        Extract Aadhaar number from text
        
        Args:
            text (str): OCR extracted text
            
        Returns:
            str or None: Aadhaar number if found
        """
        # Remove all non-digits
        digits_only = re.sub(r'\D', '', text)
        
        # Look for 12 consecutive digits
        aadhaar_matches = re.findall(r'\d{12}', digits_only)
        
        if aadhaar_matches:
            return aadhaar_matches[0]
        
        return None
    
    def extract_name(self, text, document_type):
        """
        Extract name from document text (best-effort)
        
        Args:
            text (str): OCR extracted text
            document_type (str): 'pan' or 'aadhaar'
            
        Returns:
            str or None: Extracted name if found
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Common keywords that appear near name in documents
        name_keywords = ['name', 'naam', 'father', 'पिता']
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            # Check if this line contains name keyword
            if any(keyword in line_lower for keyword in name_keywords):
                # Name might be on same line after colon or on next line
                if ':' in line:
                    name = line.split(':', 1)[1].strip()
                    if name and len(name) > 3:
                        return name
                elif i + 1 < len(lines):
                    name = lines[i + 1].strip()
                    if name and len(name) > 3:
                        return name
        
        # Fallback: look for capitalized words that might be names
        for line in lines[:5]:  # Check first 5 lines
            words = line.split()
            if len(words) >= 2:
                # Check if words are capitalized (likely a name)
                if all(word[0].isupper() for word in words if word):
                    potential_name = ' '.join(words)
                    if len(potential_name) > 5 and not any(char.isdigit() for char in potential_name):
                        return potential_name
        
        return None
    
    def validate_pan_format(self, pan):
        """Validate PAN number format"""
        if not pan:
            return False
        return bool(self.PAN_PATTERN.match(pan.upper().replace(' ', '')))
    
    def validate_aadhaar_format(self, aadhaar):
        """Validate Aadhaar number format"""
        if not aadhaar:
            return False
        digits_only = re.sub(r'\D', '', aadhaar)
        return bool(self.AADHAAR_PATTERN.match(digits_only))
    
    def compare_names(self, extracted_name, registered_name, threshold=70):
        """
        Compare names using fuzzy matching
        
        Args:
            extracted_name (str): Name extracted from document
            registered_name (str): Name registered in system
            threshold (int): Similarity threshold (0-100)
            
        Returns:
            tuple: (bool is_match, int similarity_score)
        """
        if not extracted_name or not registered_name:
            return False, 0
        
        # Normalize names (lowercase, remove extra spaces)
        name1 = ' '.join(extracted_name.lower().split())
        name2 = ' '.join(registered_name.lower().split())
        
        # Calculate similarity using rapidfuzz
        similarity = fuzz.ratio(name1, name2)
        
        return similarity >= threshold, similarity
    
    def assess_ocr_confidence(self, text, extracted_data):
        """
        Assess OCR confidence based on extraction success and text quality
        
        Args:
            text (str): Raw OCR text
            extracted_data (dict): Extracted fields
            
        Returns:
            str: "high" or "low"
        """
        # Factors for confidence assessment
        confidence_score = 0
        
        # Check if text is not too short
        if len(text) > 50:
            confidence_score += 30
        
        # Check if we extracted key fields
        if extracted_data.get('extractedPAN') or extracted_data.get('extractedAadhaar'):
            confidence_score += 40
        
        # Check if we extracted a name
        if extracted_data.get('extractedName'):
            confidence_score += 30
        
        return "high" if confidence_score >= 60 else "low"
    
    def verify_document(self, image_file, document_type, registered_name):
        """
        Main verification function for document OCR
        
        Args:
            image_file: File-like object containing image
            document_type (str): 'pan' or 'aadhaar'
            registered_name (str): Customer's registered name
            
        Returns:
            dict: Verification results
        """
        try:
            # Extract text from image
            raw_text = self.extract_text_from_image(image_file)
            
            if not raw_text or len(raw_text.strip()) < 10:
                return {
                    'success': False,
                    'status': 'unreadable',
                    'message': 'Could not extract text from image. Image may be blurry or in wrong format.',
                    'rawText': raw_text
                }
            
            # Extract fields based on document type
            extracted_pan = None
            extracted_aadhaar = None
            extracted_name = None
            
            if document_type.lower() == 'pan':
                extracted_pan = self.extract_pan_number(raw_text)
                extracted_name = self.extract_name(raw_text, 'pan')
            elif document_type.lower() == 'aadhaar':
                extracted_aadhaar = self.extract_aadhaar_number(raw_text)
                extracted_name = self.extract_name(raw_text, 'aadhaar')
            
            # Validate formats
            invalid_pan = False
            invalid_aadhaar = False
            
            if extracted_pan:
                invalid_pan = not self.validate_pan_format(extracted_pan)
            
            if extracted_aadhaar:
                invalid_aadhaar = not self.validate_aadhaar_format(extracted_aadhaar)
            
            # Compare names
            name_mismatch = False
            name_similarity = 0
            
            if extracted_name and registered_name:
                is_match, similarity = self.compare_names(extracted_name, registered_name)
                name_mismatch = not is_match
                name_similarity = similarity
            
            # Prepare response data
            result_data = {
                'extractedName': extracted_name,
                'extractedPAN': extracted_pan,
                'extractedAadhaar': extracted_aadhaar,
                'nameSimilarity': name_similarity,
                'rawText': raw_text[:500]  # First 500 chars for debugging
            }
            
            # Assess confidence
            confidence = self.assess_ocr_confidence(raw_text, result_data)
            
            return {
                'success': True,
                'status': 'processed',
                'data': {
                    'extractedName': extracted_name,
                    'extractedPAN': extracted_pan,
                    'extractedAadhaar': extracted_aadhaar,
                    'nameMismatch': name_mismatch,
                    'nameSimilarity': name_similarity,
                    'invalidPAN': invalid_pan,
                    'invalidAadhaar': invalid_aadhaar,
                    'confidence': confidence,
                    'rawText': raw_text[:500]  # Limited for response size
                },
                'metadata': {
                    'processedAt': datetime.utcnow().isoformat(),
                    'documentType': document_type
                }
            }
            
        except Exception as e:
            logger.error(f"Error in document verification: {str(e)}")
            return {
                'success': False,
                'status': 'error',
                'message': f'Error processing document: {str(e)}'
            }


# Initialize OCR verifier
ocr_verifier = OCRDocumentVerifier()


@app.route('/ocr-verify', methods=['POST'])
def ocr_verify_document():
    """
    OCR Document Verification Endpoint
    
    Request:
        - Multipart form data
        - file: Image file (JPEG, PNG)
        - documentType: 'pan' or 'aadhaar'
        - registeredName: Customer's registered name for comparison
    
    Response:
        {
            "success": true,
            "status": "processed" | "unreadable" | "error",
            "data": {
                "extractedName": str,
                "extractedPAN": str,
                "extractedAadhaar": str,
                "nameMismatch": bool,
                "nameSimilarity": int (0-100),
                "invalidPAN": bool,
                "invalidAadhaar": bool,
                "confidence": "high" | "low",
                "rawText": str (debugging)
            }
        }
    """
    try:
        # Check if OCR is available
        if not OCR_AVAILABLE:
            return jsonify({
                'success': False,
                'status': 'unavailable',
                'message': 'OCR service is not available. Please install required dependencies.'
            }), 503
        
        # Validate request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Get additional parameters
        document_type = request.form.get('documentType', '').lower()
        registered_name = request.form.get('registeredName', '')
        
        if document_type not in ['pan', 'aadhaar']:
            return jsonify({
                'success': False,
                'error': 'Invalid documentType. Must be "pan" or "aadhaar"'
            }), 400
        
        if not registered_name:
            return jsonify({
                'success': False,
                'error': 'registeredName is required for name comparison'
            }), 400
        
        # Verify file type
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }), 400
        
        logger.info(f"Processing OCR verification for {document_type} document")
        
        # Process document
        result = ocr_verifier.verify_document(file, document_type, registered_name)
        
        logger.info(f"OCR verification result: {result.get('status')}")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in ocr_verify: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'error',
            'message': 'Internal server error during OCR verification'
        }), 500


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API documentation"""
    return jsonify({
        'service': 'Digital Loan Approval - AI Risk Prediction Service',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/predict-risk': 'POST - Predict loan approval risk',
            '/ocr-verify': 'POST - OCR document verification (Aadhaar/PAN)',
        },
        'documentation': 'Send POST request to endpoints with appropriate data',
        'ocrAvailable': OCR_AVAILABLE
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
