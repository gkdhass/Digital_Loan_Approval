import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { pageVariants, tableRowVariants, staggerContainer } from '../animations/variants';
import { useToast } from '../hooks/useToast.jsx';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useDebounce } from '../hooks/useDebounce';

const LoanHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
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

  // Filter logic with search
  const filteredApplications = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return applications;
    }
    
    const searchLower = debouncedSearch.toLowerCase();
    return applications.filter(app => 
      app.applicationNumber?.toLowerCase().includes(searchLower) ||
      app.loanType?.name?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower) ||
      (app.createdAt && formatDate(app.createdAt).toLowerCase().includes(searchLower))
    );
  }, [applications, debouncedSearch]);

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
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="h-8 bg-surface dark:bg-surfaceDark rounded w-1/4 mb-2 animate-pulse" />
          <div className="h-4 bg-surface dark:bg-surfaceDark rounded w-1/6 animate-pulse" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="h-16 w-16 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Failed to load loan history</h2>
            <p className="text-foregroundSecondary mb-6">{error}</p>
            <button
              onClick={fetchApplications}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
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
      className="container-custom py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">Loan History</h1>
        <p className="text-foregroundSecondary dark:text-foregroundSecondary">View all your loan applications and download agreements</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-surface0Dark" />
          <input
            type="text"
            placeholder="Search by application number, loan type, status, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-backgroundDark border border-border dark:border-borderDark dark:border-foregroundDark rounded-xl text-foreground dark:text-foregroundDark placeholder:text-foregroundSecondary dark:placeholder:text-surface0 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foregroundSecondary hover:text-foregroundSecondary dark:text-surface0Dark dark:hover:text-foregroundSecondary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center"
        >
          <div className="py-12">
            <FileText className="mx-auto text-foregroundSecondary dark:text-foregroundSecondary mb-4" size={48} />
            <p className="text-foregroundSecondary dark:text-foregroundSecondary text-lg">
              {searchQuery ? 'No matching applications found' : 'No loan applications yet'}
            </p>
            <p className="text-sm text-surface0 dark:text-foregroundSecondary mt-2">
              {searchQuery ? 'Try different search terms' : 'Apply for a loan to get started'}
            </p>
          </div>
        </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app._id}
                variants={tableRowVariants}
                custom={index}
                className="card"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 bg-secondary dark:bg-secondaryDark/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="text-foreground dark:text-foregroundSecondaryDark" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">
                              {app.applicationNumber}
                            </h3>
                            <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">{app.loanType?.name}</p>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
                          <DollarSign size={14} />
                          Loan Amount
                        </div>
                        <p className="font-semibold text-foreground dark:text-foregroundDark">{formatCurrency(app.loanAmount)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
                          <Calendar size={14} />
                          Duration
                        </div>
                        <p className="font-semibold text-foreground dark:text-foregroundDark">{app.durationMonths} months</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
                          <Clock size={14} />
                          Applied On
                        </div>
                        <p className="font-semibold text-foreground dark:text-foregroundDark">{app.createdAt ? formatDate(app.createdAt) : 'N/A'}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
                          <DollarSign size={14} />
                          Monthly EMI
                        </div>
                        <p className="font-bold text-foreground dark:text-foregroundSecondaryDark">{formatCurrency(app.emi)}</p>
                      </div>
                    </div>

                    {/* Status-specific info */}
                    {app.status === 'approved' && (
                      <div className="mt-4 p-4 bg-success-50 dark:bg-success-900/10 rounded-lg border border-success-200 dark:border-success-800">
                        <div className="flex items-center gap-2 text-success-700 dark:text-success-300">
                          <CheckCircle size={18} />
                          <span className="font-medium">Approved on {app.approvedAt ? formatDate(app.approvedAt) : 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/10 rounded-lg border border-danger-200 dark:border-danger-800">
                        <div className="flex items-start gap-2 text-danger-700 dark:text-danger-300">
                          <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Rejection Reason:</span>
                            <p className="text-sm mt-1">{app.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {app.adminNotes && (
                      <div className="mt-4 p-4 bg-surface dark:bg-backgroundDark/30 rounded-lg">
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">Admin Notes</p>
                        <p className="text-foreground dark:text-foregroundDark">{app.adminNotes}</p>
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
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-background transition-colors whitespace-nowrap"
                      >
                        <Download size={16} />
                        Download Agreement
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
    </motion.div>
  );
};

export default LoanHistory;
