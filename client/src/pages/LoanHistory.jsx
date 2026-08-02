import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { pageVariants, cardVariants } from '../animations/variants';
import { useToast } from '../hooks/useToast.jsx';

const LoanHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      // NOTE: The axios interceptor returns response.data (the HTTP body), so
      // `response` here is already { success, count, data: [...] }.
      // The actual array lives at response.data, NOT response.data.data.
      const response = await api.get('/applications');
      const list = Array.isArray(response.data) ? response.data : [];
      setApplications(list);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err?.message || 'Failed to load loan history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (applicationId, applicationNumber) => {
    try {
      const response = await api.get(`/applications/${applicationId}/agreement`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-agreement-${applicationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Loan agreement downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      showToast('Failed to download loan agreement', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Failed to load loan history</h2>
            <p className="text-secondary mb-6">{error}</p>
            <button
              onClick={fetchApplications}
              className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Retry
            </button>
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
      className="min-h-screen bg-primary py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">Loan History</h1>
          <p className="text-secondary">View all your loan applications and download agreements</p>
        </div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <p className="text-secondary">No loan applications yet</p>
            <p className="text-sm text-secondary mt-2">Apply for a loan to get started</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="card"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="text-accent-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-primary">
                              {app.applicationNumber}
                            </h3>
                            <p className="text-sm text-secondary">{app.loanType?.name}</p>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-secondary mb-1">
                          <DollarSign size={14} />
                          Loan Amount
                        </div>
                        <p className="font-semibold text-primary">{formatCurrency(app.loanAmount)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-secondary mb-1">
                          <Calendar size={14} />
                          Duration
                        </div>
                        <p className="font-semibold text-primary">{app.durationMonths} months</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-secondary mb-1">
                          <Clock size={14} />
                          Applied On
                        </div>
                        <p className="font-semibold text-primary">{formatDate(app.createdAt)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-secondary mb-1">
                          <DollarSign size={14} />
                          Monthly EMI
                        </div>
                        <p className="font-bold text-accent-600">{formatCurrency(app.emi)}</p>
                      </div>
                    </div>

                    {/* Status-specific info */}
                    {app.status === 'approved' && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle size={18} />
                          <span className="font-medium">Approved on {formatDate(app.approvedAt)}</span>
                        </div>
                      </div>
                    )}

                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start gap-2 text-red-700">
                          <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Rejection Reason:</span>
                            <p className="text-sm mt-1">{app.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {app.adminNotes && (
                      <div className="mt-4 p-4 bg-primary rounded-lg">
                        <p className="text-sm text-secondary mb-1">Admin Notes</p>
                        <p className="text-primary">{app.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    {(app.status === 'approved' || app.status === 'disbursed') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadPDF(app._id, app.applicationNumber)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                      >
                        <Download size={16} />
                        Download Agreement
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoanHistory;
