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
import { checkmarkVariants } from '../animations/variants';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(location.state?.showSuccess);

  useEffect(() => {
    fetchApplication();
    fetchDocuments();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data.data);
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/application/${id}`);
      setDocuments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('applicationId', id);
    formData.append('documentType', documentType);

    setUploading(true);
    try {
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

  if (!application) {
    return (
      <div className="min-h-screen bg-navy-50 py-12 text-center">
        <p className="text-navy-600">Application not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-navy-600 hover:text-accent-600 mb-6"
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
              className="card mb-6 bg-emerald-50 border-2 border-emerald-200 text-center"
            >
              <motion.div
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
                className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4"
              >
                <CheckCircle className="text-white" size={32} />
              </motion.div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-emerald-700 mb-4">
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
              <h1 className="text-2xl font-bold text-navy-900 mb-2">
                {application.loanType?.name}
              </h1>
              <p className="text-navy-600">{application.applicationNumber}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-navy-600 mb-1">Loan Amount</p>
                <p className="text-2xl font-bold text-navy-900">
                  ₹{application.loanAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-navy-600 mb-1">Monthly EMI</p>
                <p className="text-xl font-bold text-accent-600">
                  ₹{application.emi.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-navy-600 mb-1">Duration</p>
                <p className="text-lg font-semibold text-navy-900">
                  {application.durationMonths} months
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-navy-600 mb-1">Interest Rate</p>
                <p className="text-lg font-semibold text-navy-900">
                  {application.loanType?.interestRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-navy-600 mb-1">Total Payable</p>
                <p className="text-lg font-semibold text-navy-900">
                  ₹{application.totalPayable.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-navy-600 mb-1">Applied On</p>
                <p className="text-lg font-semibold text-navy-900">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {application.purpose && (
            <div className="mt-6 pt-6 border-t border-navy-200">
              <p className="text-sm text-navy-600 mb-1">Purpose</p>
              <p className="text-navy-900">{application.purpose}</p>
            </div>
          )}

          {application.rejectionReason && (
            <div className="mt-6 pt-6 border-t border-navy-200">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-red-700 text-sm">{application.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {application.adminNotes && (
            <div className="mt-6 pt-6 border-t border-navy-200">
              <p className="text-sm text-navy-600 mb-1">Admin Notes</p>
              <p className="text-navy-900">{application.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-navy-900 mb-6">Documents</h2>

          {application.loanType?.requiredDocuments && (
            <div className="space-y-4">
              {application.loanType.requiredDocuments.map((docType) => {
                const uploadedDoc = documents.find((d) => d.documentType === docType);
                return (
                  <div
                    key={docType}
                    className="flex items-center justify-between p-4 bg-navy-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-navy-600" size={20} />
                      <div>
                        <p className="font-medium text-navy-900 capitalize">
                          {docType.replace(/_/g, ' ')}
                        </p>
                        {uploadedDoc && (
                          <p className="text-xs text-navy-600">
                            Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                            {uploadedDoc.verificationStatus === 'verified' && (
                              <span className="ml-2 text-emerald-600">✓ Verified</span>
                            )}
                            {uploadedDoc.verificationStatus === 'rejected' && (
                              <span className="ml-2 text-red-600">✗ Rejected</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {uploadedDoc ? (
                      <a
                        href={uploadedDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Download size={16} />
                        View
                      </a>
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
