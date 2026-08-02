import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { pageVariants, cardVariants } from '../animations/variants';
import { useToast } from '../hooks/useToast';

const LoanHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
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
      <div className="min-h-screen bg-navy-50 py-8">
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-navy-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Loan History</h1>
          <p className="text-navy-600">View all your loan applications and download agreements</p>
        </div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="mx-auto text-navy-300 mb-4" size={48} />
            <p className="text-navy-600">No loan applications yet</p>
            <p className="text-sm text-gray-500 mt-2">Apply for a loan to get started</p>
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
                            <h3 className="text-lg font-bold text-navy-900">
                              {app.applicationNumber}
                            </h3>
                            <p className="text-sm text-navy-600">{app.loanType?.name}</p>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign size={14} />
                          Loan Amount
                        </div>
                        <p className="font-semibold text-navy-900">{formatCurrency(app.loanAmount)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar size={14} />
                          Duration
                        </div>
                        <p className="font-semibold text-navy-900">{app.durationMonths} months</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock size={14} />
                          Applied On
                        </div>
                        <p className="font-semibold text-navy-900">{formatDate(app.createdAt)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
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
                      <div className="mt-4 p-4 bg-navy-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                        <p className="text-navy-900">{app.adminNotes}</p>
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
