import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskAssessment from '../components/RiskAssessment';
import EligibilityScore from '../components/EligibilityScore';
import { checkmarkVariants } from '../animations/variants';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(location.state?.showSuccess);

  useEffect(() => {
    fetchApplication();
    fetchDocuments();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      // API interceptor unwraps response.data, so response is { success: true, data: application }
      setApplication(response.data);
    } catch (err) {
      console.error('Failed to fetch application:', err);
      setError(err?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/application/${id}`);
      // API interceptor unwraps response.data, so response is { success: true, data: documents }
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleFileUpload = async (e, documentType, existingDocId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('applicationId', id);
    formData.append('documentType', documentType);

    setUploading(true);
    try {
      if (existingDocId) {
        // Re-upload: delete existing document first, then upload new one
        await api.delete(`/documents/${existingDocId}`);
      }
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="h-16 w-16 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load application</h2>
          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark mb-6">{error}</p>
          <button
            onClick={() => { fetchApplication(); fetchDocuments(); }}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primaryDark text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-surface py-12 text-center">
        <p className="text-foregroundSecondary">Application not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-foregroundSecondary hover:text-primary dark:hover:text-primaryDarkMode mb-6"
        >
          <ArrowLeft size={20} />
          Back to Applications
        </button>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card mb-6 bg-success-50 dark:bg-success-900/10 border-2 border-success-200 dark:border-success-800 text-center"
            >
              <motion.div
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
                className="inline-flex items-center justify-center w-16 h-16 bg-success-600 dark:bg-success-500 rounded-full mb-4"
              >
                <CheckCircle className="text-white" size={32} />
              </motion.div>
              <h3 className="text-xl font-bold text-success-900 dark:text-success-100 mb-2">
                Application Submitted!
              </h3>
              <p className="text-success-700 dark:text-success-300 mb-4">
                Your application {application.applicationNumber} has been submitted successfully.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="btn-primary"
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application Details */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {application.loanType?.name}
              </h1>
              <p className="text-foregroundSecondary">{application.applicationNumber}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Loan Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{application.loanAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Monthly EMI</p>
                <p className="text-xl font-bold text-primary dark:text-primaryDarkMode">
                  ₹{application.emi.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Duration</p>
                <p className="text-lg font-semibold text-foreground">
                  {application.durationMonths} months
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Interest Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {application.loanType?.interestRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Total Payable</p>
                <p className="text-lg font-semibold text-foreground">
                  ₹{application.totalPayable.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foregroundSecondary mb-1">Applied On</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {application.purpose && (
            <div className="mt-6 pt-6 border-t border-border dark:border-borderDark">
              <p className="text-sm text-foregroundSecondary mb-1">Purpose</p>
              <p className="text-foreground">{application.purpose}</p>
            </div>
          )}

          {application.rejectionReason && (
            <div className="mt-6 pt-6 border-t border-border dark:border-borderDark">
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-error-900 dark:text-error-100 mb-1">Rejection Reason</p>
                    <p className="text-error-700 dark:text-error-300 text-sm">{application.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {application.adminNotes && (
            <div className="mt-6 pt-6 border-t border-border dark:border-borderDark">
              <p className="text-sm text-foregroundSecondary mb-1">Admin Notes</p>
              <p className="text-foreground">{application.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Eligibility Score */}
        {application.eligibilityScore && (
          <div className="mb-6">
            <EligibilityScore eligibilityScore={application.eligibilityScore} />
          </div>
        )}

        {/* AI Risk Assessment */}
        {application.riskAssessment && (
          <div className="mb-6">
            <RiskAssessment riskAssessment={application.riskAssessment} />
          </div>
        )}

        {/* Documents Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-foreground mb-6">Documents</h2>

          {application.loanType?.requiredDocuments && (
            <div className="space-y-4">
              {application.loanType.requiredDocuments.map((docType) => {
                const uploadedDoc = documents.find((d) => d.documentType === docType);
                return (
                  <div
                    key={docType}
                    className="flex items-center justify-between p-4 bg-surface rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-foregroundSecondary" size={20} />
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {docType.replace(/_/g, ' ')}
                        </p>
                        {uploadedDoc && (
                          <p className="text-xs text-foregroundSecondary">
                            Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                            {uploadedDoc.verificationStatus === 'verified' && (
                              <span className="ml-2 text-success-600 dark:text-success-400">✓ Verified</span>
                            )}
                            {uploadedDoc.verificationStatus === 'rejected' && (
                              <>
                                <span className="ml-2 text-error-600 dark:text-error-400">✗ Rejected</span>
                                {uploadedDoc.rejectionReason && (
                                  <span className="ml-2 text-error-500 dark:text-error-300 italic">({uploadedDoc.rejectionReason})</span>
                                )}
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {uploadedDoc ? (
                      <div className="flex gap-2">
                        <a
                          href={uploadedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Download size={16} />
                          View
                        </a>
                        {uploadedDoc.verificationStatus === 'rejected' && (
                          <label className="btn-primary flex items-center gap-2 cursor-pointer">
                            <Upload size={16} />
                            {uploading ? 'Uploading...' : 'Re-upload'}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, docType, uploadedDoc._id)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="btn-primary flex items-center gap-2 cursor-pointer">
                        <Upload size={16} />
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, docType)}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
