import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  FileText,
  User,
  Briefcase,
  Upload,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useCountUp } from '../hooks/useCountUp';
import DocumentUpload from '../components/DocumentUpload';
import DocumentChecklist from '../components/DocumentChecklist';
import PremiumLoader from '../components/PremiumLoader';
import EligibilityScore from '../components/EligibilityScore';
import { documentsAPI } from '../services/api';
import emailjs from '@emailjs/browser';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loanTypes, setLoanTypes] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [emiCalculation, setEmiCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    loanType: location.state?.loanType?._id || '',
    loanAmount: '',
    durationMonths: '',
    purpose: '',
    employmentDetails: {
      employmentType: 'salaried',
      companyName: '',
      designation: '',
      workExperienceYears: '',
      monthlyIncome: '',
    },
  });
  
  const [fieldErrors, setFieldErrors] = useState({});

  const steps = [
    { title: 'Loan Details', icon: FileText },
    { title: 'Employment', icon: Briefcase },
    { title: 'Eligibility', icon: User },
    { title: 'Documents', icon: Upload },
    { title: 'Review', icon: CheckCircle },
  ];

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  useEffect(() => {
    if (
      formData.loanType &&
      formData.loanAmount &&
      formData.durationMonths
    ) {
      calculateEMI();
    }
  }, [formData.loanType, formData.loanAmount, formData.durationMonths]);

  const fetchLoanTypes = async () => {
    try {
      const response = await api.get('/loan-types');
      // Interceptor unwraps HTTP body → response = {success, count, data:[...]}
      setLoanTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
    }
  };

  const calculateEMI = async () => {
    const selectedLoanType = loanTypes.find((lt) => lt._id === formData.loanType);
    if (!selectedLoanType) return;

    try {
      const response = await api.post('/loan-types/calculate-emi', {
        principal: parseFloat(formData.loanAmount),
        interestRate: selectedLoanType.interestRate,
        durationMonths: parseInt(formData.durationMonths),
      });
      // Interceptor unwraps HTTP body → response = {success, data:{emi,...}}
      setEmiCalculation(response.data);
    } catch (error) {
      console.error('EMI calculation failed:', error);
    }
  };

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await api.post('/loan-types/check-eligibility', {
        loanTypeId: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount),
        durationMonths: parseInt(formData.durationMonths),
        monthlyIncome: parseFloat(formData.employmentDetails.monthlyIncome),
        employmentType: formData.employmentDetails.employmentType,
        workExperienceYears: parseInt(formData.employmentDetails.workExperienceYears),
      });
      // Interceptor unwraps HTTP body → response = {success, data:{isEligible,...}}
      setEligibility(response.data);
      setLoading(false);
      return response.data.isEligible;
    } catch (error) {
      setError('Failed to check eligibility');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        loanType: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount),
        durationMonths: parseInt(formData.durationMonths),
        purpose: formData.purpose,
        employmentDetails: {
          ...formData.employmentDetails,
          workExperienceYears: parseInt(formData.employmentDetails.workExperienceYears),
          monthlyIncome: parseFloat(formData.employmentDetails.monthlyIncome),
        },
      };
      console.log('[ApplyLoan] POST /api/applications payload:', payload);

      const response = await api.post('/applications', payload);

      // Interceptor unwraps HTTP body → response = {success, data:{_id,...}}
      const applicationData = response.data;
      setApplicationId(applicationData._id);
      setLoading(false);
      return applicationData._id;
    } catch (err) {
      // err is the full axios error; err.response.data is the backend JSON body
      const errData = err.response?.data;
      const fieldErrors = errData?.errors?.map(e => `${e.field}: ${e.message}`).join('; ');
      const message = fieldErrors || errData?.message || err.message || 'Application submission failed';
      console.error('[ApplyLoan] POST /api/applications failed — status:', err.response?.status, '| body:', errData);
      setError(message);
      setLoading(false);
      return null;
    }
  };

  const handleDocumentUpload = async (formData) => {
    try {
      setUploadingDoc(true);
      const response = await documentsAPI.upload(formData);
      setDocuments([...documents, response.data]);
      setUploadingDoc(false);
      return response.data;
    } catch (err) {
      setUploadingDoc(false);
      throw err;
    }
  };

  const sendSubmissionEmail = async () => {
    try {
      // Fetch application data to get application number
      const response = await api.get(`/applications/${applicationId}`);
      // Interceptor unwraps HTTP body → response = {success, data:{...}}
      const applicationData = response.data;

      const user = JSON.parse(localStorage.getItem('user'));
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_SUBMISSION,
        {
          to_email: user.email,
          customer_name: user.fullName,
          application_number: applicationData.applicationNumber,
          loan_amount: applicationData.loanAmount,
          loan_type: selectedLoanType?.name || 'Loan',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      console.log('Application submission email sent via EmailJS');
    } catch (emailError) {
      console.error('Failed to send submission email:', emailError);
      // Don't block the flow if email fails
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await documentsAPI.delete(docId);
      setDocuments(documents.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const fetchDocuments = async (appId) => {
    try {
      const response = await documentsAPI.getByApplication(appId);
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Run eligibility check; advance to step 2 regardless of result (step 2 shows the outcome)
      await checkEligibility();
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Eligibility shown — now create the application and move to documents
      setError('');
      const appId = await handleSubmit();
      if (!appId) {
        // handleSubmit already called setError(); stay on this step so user sees the reason
        return;
      }
      setApplicationId(appId);
      await fetchDocuments(appId);
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Documents step — send submission email then navigate to success
      if (applicationId && documents.length > 0) {
        await sendSubmissionEmail();
      }
      navigate(`/applications/${applicationId}`, {
        state: { showSuccess: true },
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setEligibility(null);
    }
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    if (name === 'loanAmount') {
      const amount = parseFloat(value);
      const selectedType = loanTypes.find((lt) => lt._id === formData.loanType);
      
      if (!value || isNaN(amount)) {
        errors.loanAmount = 'Please enter a valid loan amount';
      } else if (selectedType && amount < selectedType.minAmount) {
        errors.loanAmount = `Minimum loan amount is ₹${selectedType.minAmount.toLocaleString()}`;
      } else if (selectedType && amount > selectedType.maxAmount) {
        errors.loanAmount = `Maximum loan amount is ₹${selectedType.maxAmount.toLocaleString()}`;
      } else {
        delete errors.loanAmount;
      }
    } else if (name === 'durationMonths') {
      const months = parseInt(value);
      const selectedType = loanTypes.find((lt) => lt._id === formData.loanType);
      
      if (!value || isNaN(months)) {
        errors.durationMonths = 'Please enter a valid duration';
      } else if (selectedType && months < selectedType.minDuration) {
        errors.durationMonths = `Minimum duration is ${selectedType.minDuration} months`;
      } else if (selectedType && months > selectedType.maxDuration) {
        errors.durationMonths = `Maximum duration is ${selectedType.maxDuration} months`;
      } else {
        delete errors.durationMonths;
      }
    } else if (name === 'purpose') {
      if (!value || value.trim().length < 10) {
        errors.purpose = 'Purpose must be at least 10 characters';
      } else {
        delete errors.purpose;
      }
    } else if (name === 'employment.companyName') {
      if (!value || value.trim().length < 2) {
        errors.companyName = 'Company name is required';
      } else {
        delete errors.companyName;
      }
    } else if (name === 'employment.designation') {
      if (!value || value.trim().length < 2) {
        errors.designation = 'Designation is required';
      } else {
        delete errors.designation;
      }
    } else if (name === 'employment.workExperienceYears') {
      const years = parseFloat(value);
      if (!value || isNaN(years) || years < 0) {
        errors.workExperienceYears = 'Please enter valid work experience';
      } else if (years > 50) {
        errors.workExperienceYears = 'Work experience seems too high';
      } else {
        delete errors.workExperienceYears;
      }
    } else if (name === 'employment.monthlyIncome') {
      const income = parseFloat(value);
      if (!value || isNaN(income) || income <= 0) {
        errors.monthlyIncome = 'Please enter a valid monthly income';
      } else if (income < 5000) {
        errors.monthlyIncome = 'Monthly income must be at least ₹5,000';
      } else {
        delete errors.monthlyIncome;
      }
    }
    
    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('employment.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        employmentDetails: {
          ...formData.employmentDetails,
          [field]: value,
        },
      });
      validateField(name, value);
    } else {
      setFormData({ ...formData, [name]: value });
      validateField(name, value);
    }
  };

  const selectedLoanType = loanTypes.find((lt) => lt._id === formData.loanType);

  const isStepValid = () => {
    if (currentStep === 0) {
      return formData.loanType && formData.loanAmount && formData.durationMonths && formData.purpose;
    }
    if (currentStep === 1) {
      const emp = formData.employmentDetails;
      return emp.employmentType && emp.companyName && emp.designation && emp.workExperienceYears && emp.monthlyIncome;
    }
    if (currentStep === 2) {
      return eligibility !== null;
    }
    if (currentStep === 3) {
      // Validate all required documents are uploaded
      if (!applicationId || !selectedLoanType) return false;
      
      const requiredDocs = selectedLoanType.requiredDocuments || [];
      const uploadedDocTypes = new Set(
        documents.map(doc => doc.documentType?.toLowerCase().trim().replace(/\s+/g, ' '))
      );
      
      const allDocsUploaded = requiredDocs.every(docType => 
        uploadedDocTypes.has(docType?.toLowerCase().trim().replace(/\s+/g, ' '))
      );
      
      return allDocsUploaded;
    }
    return true;
  };

  // Get missing documents for step 3
  const getMissingDocuments = () => {
    if (currentStep !== 3 || !selectedLoanType) return [];
    
    const requiredDocs = selectedLoanType.requiredDocuments || [];
    const uploadedDocTypes = new Set(
      documents.map(doc => doc.documentType?.toLowerCase().trim().replace(/\s+/g, ' '))
    );
    
    return requiredDocs.filter(docType => 
      !uploadedDocTypes.has(docType?.toLowerCase().trim().replace(/\s+/g, ' '))
    );
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-transparent py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex-1">
                  <div className="flex items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor:
                          index <= currentStep ? '#059669' : '#E2E8F0',
                        scale: index === currentStep ? 1.1 : 1,
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
                    >
                      <Icon
                        size={20}
                        className={index <= currentStep ? 'text-white' : 'text-foregroundSecondary'}
                      />
                    </motion.div>
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: index < currentStep ? '#059669' : '#E2E8F0',
                        }}
                        className="flex-1 h-1 mx-2"
                      />
                    )}
                  </div>
                  <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-2 text-center">
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <div className="card">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">
                  Loan Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="label">Loan Type</label>
                    <select
                      name="loanType"
                      value={formData.loanType}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select loan type</option>
                      {loanTypes.map((lt) => (
                        <option key={lt._id} value={lt._id}>
                          {lt.name} ({lt.interestRate}% interest)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Loan Amount (₹)</label>
                    <input
                      type="number"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.loanAmount ? 'border-error' : ''}`}
                      placeholder="500000"
                      required
                    />
                    {selectedLoanType && !fieldErrors.loanAmount && (
                      <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-1">
                        Max: ₹{selectedLoanType.maxAmount.toLocaleString()}
                      </p>
                    )}
                    {fieldErrors.loanAmount && (
                      <p className="text-error text-sm mt-1">{fieldErrors.loanAmount}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Duration (Months)</label>
                    <input
                      type="number"
                      name="durationMonths"
                      value={formData.durationMonths}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.durationMonths ? 'border-error' : ''}`}
                      placeholder="12"
                      required
                    />
                    {selectedLoanType && !fieldErrors.durationMonths && (
                      <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-1">
                        Max: {selectedLoanType.maxDurationMonths} months
                      </p>
                    )}
                    {fieldErrors.durationMonths && (
                      <p className="text-error text-sm mt-1">{fieldErrors.durationMonths}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Loan Purpose</label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.purpose ? 'border-error' : ''}`}
                      rows="3"
                      placeholder="Describe the purpose of this loan (at least 10 characters)"
                      required
                    />
                    {fieldErrors.purpose && (
                      <p className="text-error text-sm mt-1">{fieldErrors.purpose}</p>
                    )}
                  </div>

                  {emiCalculation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-secondary dark:bg-secondaryDark/10 border border-secondary dark:border-primary rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="text-foreground dark:text-secondaryDark" size={20} />
                        <h3 className="font-bold text-foreground dark:text-foregroundDark">EMI Calculation</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">Monthly EMI</p>
                          <p className="text-2xl font-bold text-foreground dark:text-secondaryDark">
                            ₹{emiCalculation.emi.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">Total Payable</p>
                          <p className="text-xl font-bold text-foreground dark:text-foregroundDark">
                            ₹{emiCalculation.totalPayable.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">Interest Amount</p>
                          <p className="text-lg font-semibold text-foreground dark:text-border">
                            ₹{emiCalculation.interestAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">
                  Employment Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="label">Employment Type</label>
                    <select
                      name="employment.employmentType"
                      value={formData.employmentDetails.employmentType}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self Employed</option>
                      <option value="business">Business</option>
                      <option value="retired">Retired</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Company/Business Name</label>
                    <input
                      type="text"
                      name="employment.companyName"
                      value={formData.employmentDetails.companyName}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.companyName ? 'border-error' : ''}`}
                      required
                    />
                    {fieldErrors.companyName && (
                      <p className="text-error text-sm mt-1">{fieldErrors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Designation/Role</label>
                    <input
                      type="text"
                      name="employment.designation"
                      value={formData.employmentDetails.designation}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.designation ? 'border-error' : ''}`}
                      required
                    />
                    {fieldErrors.designation && (
                      <p className="text-error text-sm mt-1">{fieldErrors.designation}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Work Experience (Years)</label>
                    <input
                      type="number"
                      name="employment.workExperienceYears"
                      value={formData.employmentDetails.workExperienceYears}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.workExperienceYears ? 'border-error' : ''}`}
                      required
                    />
                    {fieldErrors.workExperienceYears && (
                      <p className="text-error text-sm mt-1">{fieldErrors.workExperienceYears}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Monthly Income (₹)</label>
                    <input
                      type="number"
                      name="employment.monthlyIncome"
                      value={formData.employmentDetails.monthlyIncome}
                      onChange={handleChange}
                      className={`input-field ${fieldErrors.monthlyIncome ? 'border-error' : ''}`}
                      placeholder="50000"
                      required
                    />
                    {selectedLoanType && !fieldErrors.monthlyIncome && (
                      <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-1">
                        Minimum required: ₹{selectedLoanType.minIncome.toLocaleString()}
                      </p>
                    )}
                    {fieldErrors.monthlyIncome && (
                      <p className="text-error text-sm mt-1">{fieldErrors.monthlyIncome}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">
                  Eligibility Check
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <PremiumLoader message="Checking eligibility..." size="lg" />
                  </div>
                ) : eligibility ? (
                  <div className="space-y-6">
                    {/* Submission error from POST /api/applications */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 rounded-xl"
                      >
                        <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-danger-800 dark:text-danger-300 text-sm">Failed to create application</p>
                          <p className="text-danger-700 dark:text-danger-400 text-sm mt-0.5">{error}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Enhanced Eligibility Score Display with Factors */}
                    {eligibility.eligibilityScore && (
                      <EligibilityScore eligibilityScore={eligibility.eligibilityScore} />
                    )}

                    {/* Legacy Eligibility Display (fallback) */}
                    {!eligibility.eligibilityScore && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center py-12 rounded-2xl ${
                          eligibility.isEligible
                            ? 'bg-success-50 dark:bg-success-900/10 border-2 border-success-200 dark:border-success-800'
                            : 'bg-danger-50 dark:bg-danger-900/10 border-2 border-danger-200 dark:border-danger-800'
                        }`}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                            eligibility.isEligible ? 'bg-success-600' : 'bg-danger-600'
                          }`}
                        >
                          {eligibility.isEligible ? (
                            <CheckCircle className="text-white" size={40} />
                          ) : (
                            <motion.div className="text-white text-4xl font-bold">✕</motion.div>
                          )}
                        </motion.div>

                        <h3 className={`text-2xl font-bold mb-2 ${
                          eligibility.isEligible ? 'text-success-900 dark:text-success-200' : 'text-danger-900 dark:text-danger-200'
                        }`}>
                          {eligibility.isEligible ? 'Eligible!' : 'Not Eligible'}
                        </h3>
                        <p className={`mb-4 ${
                          eligibility.isEligible ? 'text-success-700 dark:text-success-300' : 'text-danger-700 dark:text-danger-300'
                        }`}>
                          Eligibility Score: {eligibility.score}/100
                        </p>

                        <div className={`max-w-md mx-auto text-left p-4 rounded-xl ${
                          eligibility.isEligible 
                            ? 'bg-white dark:bg-surfaceDark' 
                            : 'bg-danger-100 dark:bg-danger-900/20'
                        }`}>
                          <p className="font-semibold mb-2 text-foreground dark:text-foregroundDark">
                            {eligibility.isEligible ? 'Next Steps:' : 'Reasons:'}
                          </p>
                          <ul className="space-y-1 text-sm text-foreground dark:text-foregroundSecondary">
                            {eligibility.reasons.map((reason, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-foreground dark:text-secondaryDark mt-1">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">
                  Upload Documents
                </h2>

                <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                  <p className="text-sm text-accent dark:text-accentDark">
                    <strong>Required Documents:</strong> Please upload the following documents for your {selectedLoanType?.name} application.
                  </p>
                </div>

                {applicationId ? (
                  <>
                    {/* Document Checklist - Real-time feedback */}
                    <DocumentChecklist
                      requiredDocuments={selectedLoanType?.requiredDocuments || []}
                      uploadedDocuments={documents}
                    />

                    {/* Document Upload Component */}
                    <DocumentUpload
                      onUpload={handleDocumentUpload}
                      documentTypes={selectedLoanType?.requiredDocuments || []}
                      applicationId={applicationId}
                      existingDocuments={documents}
                      onDeleteDocument={handleDeleteDocument}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 text-surface0 dark:text-surface0Dark">
                    <p>Complete the previous steps to upload documents</p>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">
                  Review & Submit
                </h2>

                <div className="space-y-6">
                  <div className="bg-surface dark:bg-transparent rounded-xl p-6">
                    <h3 className="font-bold text-foreground dark:text-foregroundDark mb-4">Loan Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Loan Type:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">{selectedLoanType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Amount:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">₹{parseFloat(formData.loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Duration:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">{formData.durationMonths} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Monthly EMI:</span>
                        <span className="font-bold text-foreground dark:text-secondaryDark">₹{emiCalculation?.emi.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface dark:bg-transparent rounded-xl p-6">
                    <h3 className="font-bold text-foreground dark:text-foregroundDark mb-4">Employment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Employment Type:</span>
                        <span className="font-semibold capitalize text-foreground dark:text-foregroundDark">
                          {formData.employmentDetails.employmentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Company:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">{formData.employmentDetails.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Designation:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">{formData.employmentDetails.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Experience:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">{formData.employmentDetails.workExperienceYears} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foregroundSecondary dark:text-foregroundSecondary">Monthly Income:</span>
                        <span className="font-semibold text-foreground dark:text-foregroundDark">₹{parseFloat(formData.employmentDetails.monthlyIncome).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface dark:bg-transparent rounded-xl p-6">
                    <h3 className="font-bold text-foreground dark:text-foregroundDark mb-4">Uploaded Documents</h3>
                    {documents.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {documents.map((doc) => (
                          <div key={doc._id} className="flex justify-between items-center py-2 border-b border-border dark:border-borderDark dark:border-foregroundDark last:border-0">
                            <span className="text-foreground dark:text-foregroundSecondary">{doc.fileName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              doc.verificationStatus === 'verified' ? 'bg-successBadge text-successText dark:bg-successBadgeDark dark:text-successTextDark' :
                              doc.verificationStatus === 'rejected' ? 'bg-errorBadge text-errorText dark:bg-errorBadgeDark dark:text-errorTextDark' :
                              'bg-warningBadge text-warningText dark:bg-warningBadgeDark dark:text-warningTextDark'
                            }`}>
                              {doc.verificationStatus || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-surface0 dark:text-surface0Dark">No documents uploaded yet</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 rounded-xl p-4 text-danger-800 dark:text-danger-300 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-border dark:border-borderDark dark:border-foregroundDark">
            {/* Missing Documents Warning for Step 3 */}
            {currentStep === 3 && !isStepValid() && getMissingDocuments().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning dark:text-warningDark flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-warning dark:text-warningDark mb-1">
                      Please upload the following required documents:
                    </p>
                    <ul className="space-y-1">
                      {getMissingDocuments().map((doc) => (
                        <li key={doc} className="text-sm text-warning dark:text-warningDark">
                          • {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid() || loading || uploadingDoc}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === steps.length - 1 ? (
                  loading ? 'Submitting...' : 'Submit Application'
                ) : currentStep === 3 ? (
                  uploadingDoc ? 'Uploading...' : 'Review & Submit'
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;
