import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Building2,
  Briefcase,
  Download,
  AlertCircle,
  FileCheck,
  FileX,
  MoreVertical,
  Edit
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import EligibilityScore from '../../components/EligibilityScore';
import DocumentChecklist from '../../components/DocumentChecklist';
import OCRStatusBadge from '../../components/OCRStatusBadge';
import { pageVariants, cardVariants } from '../../animations/variants';
import useCountUp from '../../hooks/useCountUp';
import { useToast } from '../../hooks/useToast.jsx';
import { sendDecisionEmail } from '../../utils/emailService';

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshingDocs, setRefreshingDocs] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplication();
    fetchDocuments();
  }, [id]);

  // Poll for pending OCR status updates
  useEffect(() => {
    if (activeTab !== 'documents') return;

    const hasPendingOCR = documents.some(
      doc => doc.ocrVerification?.ocrStatus === 'pending'
    );

    if (!hasPendingOCR) return;

    // Poll every 5 seconds while there are pending OCR verifications
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, documents, id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      // API interceptor unwraps response.data, so response is { success: true, data: application }
      setApplication(response.data);
    } catch (error) {
      console.error('[AdminApplicationDetail] FAILED to fetch application:', {
        id,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/application/${id}`);
      // API interceptor unwraps response.data, so response is { success: true, data: documents }
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleDecision = async () => {
    try {
      console.log('[AdminApplicationDetail] Making decision:', {
        applicationId: id,
        decisionType,
        hasReason: !!decisionReason,
      });

      const payload = {
        status: decisionType,
        adminNotes: decisionReason,
        rejectionReason: decisionType === 'rejected' ? decisionReason : undefined
      };

      console.log('[AdminApplicationDetail] Sending payload:', payload);

      const response = await api.put(`/applications/${id}/status`, payload);

      console.log('[AdminApplicationDetail] Decision SUCCESS:', response);
      console.log('[AdminApplicationDetail] Response structure:', {
        responseType: typeof response,
        hasSuccess: !!response.success,
        hasData: !!response.data,
        status: response?.status,
        applicationNumber: response?.applicationNumber
      });

      // API interceptor unwraps response.data, so response is { success, data: application }
      setApplication(response.data);
      setShowDecisionModal(false);
      setDecisionReason('');
      setDecisionType('');
      showToast(`Application ${decisionType.replace('_', ' ')} successfully`, 'success');

      // Send decision email using shared utility for approved/rejected
      if (decisionType === 'approved' || decisionType === 'rejected') {
        try {
          await sendDecisionEmail(response.data, decisionType, {
            rejectionReason: decisionType === 'rejected' ? decisionReason : undefined
          });
          showToast('Email sent to customer', 'success');
        } catch (emailError) {
          console.error('Failed to send decision email:', emailError);
          showToast('Failed to send email notification', 'error');
          // Don't block the flow if email fails
        }
      }
    } catch (error) {
      console.error('[AdminApplicationDetail] FAILED to update status:', {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });
      showToast('Failed to update application status', 'error');
    }
  };

  const handleVerifyDocument = async (docId, status, remarks) => {
    try {
      await api.put(`/documents/${docId}/verify`, {
        verificationStatus: status,
        rejectionReason: remarks
      });
      fetchDocuments();
      showToast(`Document ${status} successfully`, 'success');
    } catch (error) {
      console.error('Failed to verify document:', error);
      showToast('Failed to verify document', 'error');
    }
  };

  const generatePDF = async () => {
    try {
      const response = await api.get(`/applications/${id}/agreement`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-agreement-${application.applicationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const statusTimeline = [
    { status: 'submitted', label: 'Submitted', icon: FileText },
    { status: 'under_review', label: 'Under Review', icon: Clock },
    { status: 'documents_requested', label: 'Documents Requested', icon: AlertCircle },
    { status: 'approved', label: 'Approved', icon: CheckCircle },
    { status: 'rejected', label: 'Rejected', icon: XCircle },
    { status: 'disbursed', label: 'Disbursed', icon: DollarSign }
  ];

  const getCurrentStatusIndex = () => {
    return statusTimeline.findIndex(s => s.status === application?.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-border dark:bg-cardDark rounded w-1/4" />
            <div className="h-64 bg-border dark:bg-cardDark rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-foregroundMuted dark:text-foregroundMutedDark mx-auto mb-4" />
            <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Application not found</p>
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-2 mt-4 text-primary dark:text-primaryDarkMode hover:text-primaryHover dark:hover:text-primaryHoverDark"
            >
              <ArrowLeft size={16} />
              Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-surface py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-foregroundSecondary dark:text-foregroundSecondaryDark hover:text-foreground mb-4"
          >
            <ArrowLeft size={16} />
            Back to Applications
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {application.applicationNumber}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={application.status} />
                {application.createdAt && (
                  <span className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                    Applied on {formatDate(application.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {application.status === 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-border transition-colors"
                >
                  <Download size={16} />
                  Download Agreement
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDecisionModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                style={{ backgroundColor: '#E53935', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C62828'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E53935'}
              >
                <Edit size={16} />
                Update Status
              </motion.button>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-6">Application Timeline</h3>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-border dark:bg-cardDark">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(getCurrentStatusIndex() / (statusTimeline.length - 1)) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-primary"
              />
            </div>
            <div className="relative flex justify-between">
              {statusTimeline.map((step, index) => {
                const Icon = step.icon;
                const currentIndex = getCurrentStatusIndex();
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div key={step.status} className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                        isActive ? 'bg-primary text-white' : 'bg-border dark:bg-cardDark text-foregroundMuted dark:text-foregroundMutedDark'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-primary' : 'text-foregroundMuted dark:text-foregroundMutedDark'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          {['overview', 'documents', 'eligibility', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foregroundSecondary dark:text-foregroundSecondaryDark hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Customer Details */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Customer Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Full Name</p>
                    <p className="font-semibold text-foreground">{application.user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Email</p>
                    <p className="font-semibold text-foreground">{application.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Phone</p>
                    <p className="font-semibold text-foreground">{application.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Address</p>
                    <p className="font-semibold text-foreground">
                      {application.user?.address?.street}, {application.user?.address?.city}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Loan Details */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Loan Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Loan Type</p>
                    <p className="font-semibold text-foreground">{application.loanType?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Loan Amount</p>
                    <p className="font-semibold text-foreground">{formatCurrency(application.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Duration</p>
                    <p className="font-semibold text-foreground">{application.durationMonths} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Interest Rate</p>
                    <p className="font-semibold text-foreground">{application.loanType?.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Monthly EMI</p>
                    <p className="font-bold text-primary">{formatCurrency(application.emi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Total Payable</p>
                    <p className="font-semibold text-foreground">{formatCurrency(application.totalPayable)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Employment Details */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Employment Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Employment Type</p>
                    <p className="font-semibold text-foreground capitalize">
                      {application.employmentDetails?.employmentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Company</p>
                    <p className="font-semibold text-foreground">
                      {application.employmentDetails?.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Designation</p>
                    <p className="font-semibold text-foreground">
                      {application.employmentDetails?.designation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Experience</p>
                    <p className="font-semibold text-foreground">
                      {application.employmentDetails?.workExperienceYears} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Monthly Income</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(application.employmentDetails?.monthlyIncome)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Purpose */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Loan Purpose</h3>
                </div>
                <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">{application.purpose}</p>
                
                {application.adminNotes && (
                  <div className="mt-6 p-4 bg-surface rounded-lg">
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mb-2">Admin Notes</p>
                    <p className="text-foreground">{application.adminNotes}</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Document Checklist - Admin View */}
              <DocumentChecklist
                requiredDocuments={application.loanType?.requiredDocuments || []}
                uploadedDocuments={documents}
                compact={true}
              />

              {/* Uploaded Documents List */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground">Uploaded Documents</h3>
                  {documents.some(doc => doc.ocrVerification?.ocrStatus === 'pending') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setRefreshingDocs(true);
                        fetchDocuments().finally(() => setRefreshingDocs(false));
                      }}
                      disabled={refreshingDocs}
                      className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-accent dark:text-accentDarkMode rounded-lg text-sm font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/30 disabled:opacity-50"
                    >
                      <motion.div
                        animate={{ rotate: refreshingDocs ? 360 : 0 }}
                        transition={{ duration: 1, repeat: refreshingDocs ? Infinity : 0, ease: 'linear' }}
                      >
                        <FileText className="h-4 w-4" />
                      </motion.div>
                      {refreshingDocs ? 'Refreshing...' : 'Refresh OCR Status'}
                    </motion.button>
                  )}
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-foregroundMuted dark:text-foregroundMutedDark mx-auto mb-4" />
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-input dark:bg-cardSecondaryDark rounded-xl border border-border overflow-hidden"
                      >
                        {/* Document Header */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-border">
                              <FileText className="h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{doc.fileName}</p>
                              <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark capitalize">
                                {doc.documentType?.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-accent dark:text-accentDarkMode rounded-lg text-sm font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/40 flex items-center gap-1"
                            >
                              <Download size={14} />
                              View
                            </a>
                            {doc.verificationStatus === 'verified' && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-medium">
                                <FileCheck size={16} />
                                <span>Verified</span>
                              </div>
                            )}
                            {doc.verificationStatus === 'rejected' && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-lg text-sm font-medium">
                                <FileX size={16} />
                                <span>Rejected</span>
                              </div>
                            )}
                            {doc.verificationStatus === 'pending' && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-lg text-sm font-medium">
                                <Clock size={16} />
                                <span>Pending</span>
                              </div>
                            )}
                            {doc.verificationStatus === 'pending' && (
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    const remarks = prompt('Enter verification remarks (optional):');
                                    handleVerifyDocument(doc._id, 'verified', remarks);
                                  }}
                                  className="px-3 py-1 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 rounded-lg text-sm font-medium hover:bg-success-100 dark:hover:bg-success-900/30"
                                >
                                  Verify
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    const remarks = prompt('Enter rejection reason:');
                                    if (remarks) handleVerifyDocument(doc._id, 'rejected', remarks);
                                  }}
                                  className="px-3 py-1 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 rounded-lg text-sm font-medium hover:bg-error-100 dark:hover:bg-error-900/30"
                                >
                                  Reject
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* OCR Status Badge (for PAN/Aadhaar only) */}
                        {doc.ocrVerification && (
                          <div className="px-4 pb-4">
                            <OCRStatusBadge
                              ocrVerification={doc.ocrVerification}
                              registeredName={application.user?.fullName}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'eligibility' && (
            <motion.div
              key="eligibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Enhanced Eligibility Score Display */}
              {application.eligibilityScore ? (
                <EligibilityScore eligibilityScore={application.eligibilityScore} />
              ) : (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="card p-6"
                >
                  <h3 className="text-lg font-bold text-foreground mb-6">Eligibility Snapshot</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
                      <div>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Eligibility Score</p>
                        <p className="text-3xl font-bold text-primary">
                          {application.eligibilityScore || 'N/A'}
                        </p>
                      </div>
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {application.eligibilityScore >= 70 ? (
                          <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
                        ) : (
                          <XCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-input dark:bg-cardSecondaryDark rounded-lg">
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">EMI Ratio</p>
                        <p className="text-lg font-bold text-foreground">
                          {((application.emi / application.employmentDetails?.monthlyIncome) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-input dark:bg-cardSecondaryDark rounded-lg">
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Debt-to-Income</p>
                        <p className="text-lg font-bold text-foreground">
                          {((application.loanAmount / (application.employmentDetails?.monthlyIncome * 12)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-6">Application History</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="w-0.5 h-full bg-border dark:bg-cardDark mt-2" />
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-foreground">Application Submitted</p>
                      <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{application.createdAt ? formatDate(application.createdAt) : 'N/A'}</p>
                    </div>
                  </div>

                  {application.reviewedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-foregroundSecondary rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        <div className="w-0.5 h-full bg-border dark:bg-cardDark mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium text-foreground">Application Reviewed</p>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{application.reviewedAt ? formatDate(application.reviewedAt) : 'N/A'}</p>
                        {application.reviewedBy && (
                          <p className="text-sm text-foregroundMuted dark:text-foregroundMutedDark">
                            Reviewed by: {application.reviewedBy?.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {application.approvedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-success-600 dark:bg-success-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Application Approved</p>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{application.approvedAt ? formatDate(application.approvedAt) : 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {application.disbursedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-accent dark:bg-accent rounded-full flex items-center justify-center">
                          <DollarSign size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Loan Disbursed</p>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{application.disbursedAt ? formatDate(application.disbursedAt) : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decision Modal */}
      <AnimatePresence>
        {showDecisionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDecisionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Update Application Status</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label mb-2">Select Action</label>
                  <select
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select an action</option>
                    <option value="under_review">Under Review</option>
                    <option value="documents_requested">Request Documents</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="disbursed">Disburse</option>
                  </select>
                </div>
                
                <div>
                  <label className="label mb-2">Reason/Notes</label>
                  <textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Add any notes or reasons for this decision..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="flex-1 px-4 py-2 bg-input dark:bg-cardDark text-foreground dark:text-foregroundDark rounded-lg hover:bg-border dark:hover:bg-borderDark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecision}
                  disabled={!decisionType}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminApplicationDetail;
