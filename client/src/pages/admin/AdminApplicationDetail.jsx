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
  const { showToast } = useToast();

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
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleDecision = async () => {
    try {
      const response = await api.put(`/applications/${id}/status`, {
        status: decisionType,
        adminNotes: decisionReason,
        rejectionReason: decisionType === 'rejected' ? decisionReason : undefined
      });

      setApplication(response.data.data);
      setShowDecisionModal(false);
      setDecisionReason('');
      setDecisionType('');
      showToast(`Application ${decisionType.replace('_', ' ')} successfully`, 'success');

      // Send decision email using shared utility for approved/rejected
      if (decisionType === 'approved' || decisionType === 'rejected') {
        try {
          await sendDecisionEmail(response.data.data, decisionType, {
            rejectionReason: decisionType === 'rejected' ? decisionReason : undefined
          });
        } catch (emailError) {
          console.error('Failed to send decision email:', emailError);
          // Don't block the flow if email fails
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
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
      <div className="min-h-screen bg-navy-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-navy-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Application not found</p>
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-2 mt-4 text-accent-600 hover:text-accent-700"
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
      className="min-h-screen bg-navy-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Applications
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">
                {application.applicationNumber}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={application.status} />
                <span className="text-sm text-gray-600">
                  Applied on {formatDate(application.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {application.status === 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors"
                >
                  <Download size={16} />
                  Download Agreement
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDecisionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
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
          <h3 className="text-lg font-bold text-navy-900 mb-6">Application Timeline</h3>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(getCurrentStatusIndex() / (statusTimeline.length - 1)) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-accent-600"
              />
            </div>
            <div className="relative flex justify-between">
              {statusTimeline.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= getCurrentStatusIndex();
                const isCurrent = index === getCurrentStatusIndex();
                
                return (
                  <div key={step.status} className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                        isActive ? 'bg-accent-600 text-white' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-accent-200' : ''}`}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-accent-700' : 'text-gray-400'
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
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['overview', 'documents', 'eligibility', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-accent-600 border-b-2 border-accent-600'
                  : 'text-gray-600 hover:text-gray-900'
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
                  <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">Customer Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-navy-900">{application.user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-navy-900">{application.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-navy-900">{application.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-navy-900">
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
                  <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">Loan Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan Type</p>
                    <p className="font-semibold text-navy-900">{application.loanType?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-semibold text-navy-900">{formatCurrency(application.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-navy-900">{application.durationMonths} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-navy-900">{application.loanType?.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="font-bold text-accent-600">{formatCurrency(application.emi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payable</p>
                    <p className="font-semibold text-navy-900">{formatCurrency(application.totalPayable)}</p>
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
                  <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">Employment Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-semibold text-navy-900 capitalize">
                      {application.employmentDetails?.employmentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold text-navy-900">
                      {application.employmentDetails?.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-semibold text-navy-900">
                      {application.employmentDetails?.designation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold text-navy-900">
                      {application.employmentDetails?.workExperienceYears} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="font-semibold text-navy-900">
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
                  <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">Loan Purpose</h3>
                </div>
                <p className="text-gray-700">{application.purpose}</p>
                
                {application.adminNotes && (
                  <div className="mt-6 p-4 bg-navy-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                    <p className="text-navy-900">{application.adminNotes}</p>
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
            >
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <h3 className="text-lg font-bold text-navy-900 mb-6">Uploaded Documents</h3>
                
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-navy-900">{doc.fileName}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {doc.documentType?.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.verificationStatus === 'verified' && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <FileCheck size={16} />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          )}
                          {doc.verificationStatus === 'rejected' && (
                            <div className="flex items-center gap-1 text-red-600">
                              <FileX size={16} />
                              <span className="text-sm font-medium">Rejected</span>
                            </div>
                          )}
                          {!doc.verificationStatus && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const remarks = prompt('Enter verification remarks (optional):');
                                  handleVerifyDocument(doc._id, 'verified', remarks);
                                }}
                                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200"
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
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                              >
                                Reject
                              </motion.button>
                            </div>
                          )}
                        </div>
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
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="card p-6"
              >
                <h3 className="text-lg font-bold text-navy-900 mb-6">Eligibility Snapshot</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Eligibility Score</p>
                      <p className="text-3xl font-bold text-accent-600">
                        {application.eligibilityScore || 'N/A'}
                      </p>
                    </div>
                    <div className="h-16 w-16 bg-accent-100 rounded-full flex items-center justify-center">
                      {application.eligibilityScore >= 70 ? (
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">EMI Ratio</p>
                      <p className="text-lg font-bold text-navy-900">
                        {((application.emi / application.employmentDetails?.monthlyIncome) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Debt-to-Income</p>
                      <p className="text-lg font-bold text-navy-900">
                        {((application.loanAmount / (application.employmentDetails?.monthlyIncome * 12)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
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
                <h3 className="text-lg font-bold text-navy-900 mb-6">Application History</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 bg-accent-600 rounded-full flex items-center justify-center">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-navy-900">Application Submitted</p>
                      <p className="text-sm text-gray-600">{formatDate(application.createdAt)}</p>
                    </div>
                  </div>

                  {application.reviewedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-navy-600 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium text-navy-900">Application Reviewed</p>
                        <p className="text-sm text-gray-600">{formatDate(application.reviewedAt)}</p>
                        {application.reviewedBy && (
                          <p className="text-sm text-gray-500">
                            Reviewed by: {application.reviewedBy?.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {application.approvedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">Application Approved</p>
                        <p className="text-sm text-gray-600">{formatDate(application.approvedAt)}</p>
                      </div>
                    </div>
                  )}

                  {application.disbursedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <DollarSign size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">Loan Disbursed</p>
                        <p className="text-sm text-gray-600">{formatDate(application.disbursedAt)}</p>
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
              <h3 className="text-xl font-bold text-navy-900 mb-4">Update Application Status</h3>
              
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
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecision}
                  disabled={!decisionType}
                  className="flex-1 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
