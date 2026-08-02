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
} from 'lucide-react';
import api from '../services/api';
import { useCountUp } from '../hooks/useCountUp';
import DocumentUpload from '../components/DocumentUpload';
import { documentsAPI } from '../services/api';

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
      setLoanTypes(response.data.data);
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
      setEmiCalculation(response.data.data);
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
      setEligibility(response.data.data);
      setLoading(false);
      return response.data.data.isEligible;
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

      const response = await api.post('/applications', {
        loanType: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount),
        durationMonths: parseInt(formData.durationMonths),
        purpose: formData.purpose,
        employmentDetails: {
          ...formData.employmentDetails,
          workExperienceYears: parseInt(formData.employmentDetails.workExperienceYears),
          monthlyIncome: parseFloat(formData.employmentDetails.monthlyIncome),
        },
      });

      setApplicationId(response.data.data._id);
      return response.data.data._id;
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
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
      const isEligible = await checkEligibility();
      if (isEligible) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      // After eligibility check, create application and move to documents
      const appId = await handleSubmit();
      if (appId) {
        setApplicationId(appId);
        await fetchDocuments(appId);
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
      navigate(`/applications/${applicationId}`, {
        state: { showSuccess: true },
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setEligibility(null);
    }
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
    } else {
      setFormData({ ...formData, [name]: value });
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
      return applicationId !== null;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-12">
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
                        className={index <= currentStep ? 'text-white' : 'text-navy-400'}
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
                  <p className="text-xs text-navy-600 mt-2 text-center">
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
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
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
                      className="input-field"
                      placeholder="500000"
                      required
                    />
                    {selectedLoanType && (
                      <p className="text-xs text-navy-600 mt-1">
                        Max: ₹{selectedLoanType.maxAmount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Duration (Months)</label>
                    <input
                      type="number"
                      name="durationMonths"
                      value={formData.durationMonths}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="12"
                      required
                    />
                    {selectedLoanType && (
                      <p className="text-xs text-navy-600 mt-1">
                        Max: {selectedLoanType.maxDurationMonths} months
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Loan Purpose</label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="input-field"
                      rows="3"
                      placeholder="Describe the purpose of this loan"
                      required
                    />
                  </div>

                  {emiCalculation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-accent-50 border border-accent-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="text-accent-600" size={20} />
                        <h3 className="font-bold text-navy-900">EMI Calculation</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-navy-600">Monthly EMI</p>
                          <p className="text-2xl font-bold text-accent-600">
                            ₹{emiCalculation.emi.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-navy-600">Total Payable</p>
                          <p className="text-xl font-bold text-navy-900">
                            ₹{emiCalculation.totalPayable.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-navy-600">Interest Amount</p>
                          <p className="text-lg font-semibold text-navy-700">
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
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
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
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Designation/Role</label>
                    <input
                      type="text"
                      name="employment.designation"
                      value={formData.employmentDetails.designation}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Work Experience (Years)</label>
                    <input
                      type="number"
                      name="employment.workExperienceYears"
                      value={formData.employmentDetails.workExperienceYears}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Monthly Income (₹)</label>
                    <input
                      type="number"
                      name="employment.monthlyIncome"
                      value={formData.employmentDetails.monthlyIncome}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="50000"
                      required
                    />
                    {selectedLoanType && (
                      <p className="text-xs text-navy-600 mt-1">
                        Minimum required: ₹{selectedLoanType.minIncome.toLocaleString()}
                      </p>
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
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
                  Eligibility Check
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
                    <p className="text-navy-600 mt-4">Checking eligibility...</p>
                  </div>
                ) : eligibility ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-center py-12 rounded-2xl ${
                      eligibility.isEligible
                        ? 'bg-emerald-50 border-2 border-emerald-200'
                        : 'bg-red-50 border-2 border-red-200'
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                        eligibility.isEligible ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    >
                      {eligibility.isEligible ? (
                        <CheckCircle className="text-white" size={40} />
                      ) : (
                        <motion.div className="text-white text-4xl font-bold">✕</motion.div>
                      )}
                    </motion.div>

                    <h3 className={`text-2xl font-bold mb-2 ${
                      eligibility.isEligible ? 'text-emerald-900' : 'text-red-900'
                    }`}>
                      {eligibility.isEligible ? 'Eligible!' : 'Not Eligible'}
                    </h3>
                    <p className={`mb-4 ${
                      eligibility.isEligible ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      Eligibility Score: {eligibility.score}/100
                    </p>

                    <div className={`max-w-md mx-auto text-left p-4 rounded-xl ${
                      eligibility.isEligible ? 'bg-white' : 'bg-red-100'
                    }`}>
                      <p className="font-semibold mb-2 text-navy-900">
                        {eligibility.isEligible ? 'Next Steps:' : 'Reasons:'}
                      </p>
                      <ul className="space-y-1 text-sm text-navy-700">
                        {eligibility.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-accent-600 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
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
              >
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
                  Upload Documents
                </h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-900">
                    <strong>Required Documents:</strong> Please upload the following documents for your {selectedLoanType?.name} application.
                  </p>
                </div>

                {applicationId ? (
                  <DocumentUpload
                    onUpload={handleDocumentUpload}
                    documentTypes={selectedLoanType?.requiredDocuments || []}
                    applicationId={applicationId}
                    existingDocuments={documents}
                    onDeleteDocument={handleDeleteDocument}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
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
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
                  Review & Submit
                </h2>

                <div className="space-y-6">
                  <div className="bg-navy-50 rounded-xl p-6">
                    <h3 className="font-bold text-navy-900 mb-4">Loan Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-navy-600">Loan Type:</span>
                        <span className="font-semibold">{selectedLoanType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Amount:</span>
                        <span className="font-semibold">₹{parseFloat(formData.loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Duration:</span>
                        <span className="font-semibold">{formData.durationMonths} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Monthly EMI:</span>
                        <span className="font-bold text-accent-600">₹{emiCalculation?.emi.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-50 rounded-xl p-6">
                    <h3 className="font-bold text-navy-900 mb-4">Employment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-navy-600">Employment Type:</span>
                        <span className="font-semibold capitalize">
                          {formData.employmentDetails.employmentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Company:</span>
                        <span className="font-semibold">{formData.employmentDetails.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Designation:</span>
                        <span className="font-semibold">{formData.employmentDetails.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Experience:</span>
                        <span className="font-semibold">{formData.employmentDetails.workExperienceYears} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-600">Monthly Income:</span>
                        <span className="font-semibold">₹{parseFloat(formData.employmentDetails.monthlyIncome).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-50 rounded-xl p-6">
                    <h3 className="font-bold text-navy-900 mb-4">Uploaded Documents</h3>
                    {documents.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {documents.map((doc) => (
                          <div key={doc._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <span className="text-navy-700">{doc.fileName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              doc.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                              doc.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.verificationStatus || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents uploaded yet</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-navy-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid() || loading || uploadingDoc}
              className="btn-primary flex items-center gap-2"
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
  );
};

export default ApplyLoan;
