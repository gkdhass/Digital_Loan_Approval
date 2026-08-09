import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Trash2, Download } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';
import { useToast } from '../../hooks/useToast.jsx';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [filter, currentPage, searchTerm, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/applications/admin/all', {
        params: { 
          status: filter || undefined, 
          page: currentPage, 
          limit: 10,
          search: searchTerm || undefined,
          sortBy,
          sortOrder
        },
      });
      // Interceptor unwraps HTTP body → response = {success, data:[...], totalPages}
      setApplications(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err?.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilter('');
    setSearchTerm('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleDeleteClick = (e, application) => {
    e.preventDefault();
    e.stopPropagation();
    setApplicationToDelete(application);
    setShowDeleteConfirm(true);
  };

  const exportToCSV = () => {
    try {
      // CSV Header
      const headers = ['Applicant Name', 'Email', 'Application Number', 'Loan Type', 'Amount (Rs.)', 'Duration (Months)', 'Status', 'Applied Date'];
      
      // CSV Rows
      const rows = applications.map(app => [
        app.user?.fullName || 'N/A',
        app.user?.email || 'N/A',
        app.applicationNumber || 'N/A',
        app.loanType?.name || 'N/A',
        app.loanAmount || 0,
        app.durationMonths || 0,
        app.status || 'N/A',
        app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'
      ]);
      
      // Escape CSV fields (wrap in quotes if they contain commas)
      const escapeCSV = (field) => {
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      // Build CSV content with UTF-8 BOM for Excel compatibility
      const csvContent = '\uFEFF' + [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-applications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      showToast(`Exported ${applications.length} applications to CSV`, 'success');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      showToast('Failed to export CSV. Please try again.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    try {
      await api.delete(`/applications/admin/${applicationToDelete._id}`);
      setApplications(applications.filter((app) => app._id !== applicationToDelete._id));
      setShowDeleteConfirm(false);
      setApplicationToDelete(null);
      showToast('Application deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete application';
      showToast(errorMessage, 'error');
      setShowDeleteConfirm(false);
      setApplicationToDelete(null);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonTable rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-backgroundDark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">
              All Applications
            </h1>
            <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Review and manage loan applications</p>
          </div>
          {applications.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primaryDark text-white rounded-lg hover:bg-primaryHover dark:hover:bg-primaryHoverDark transition-colors duration-200 shadow-sm"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </motion.button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundMuted dark:text-foregroundMutedDark" />
              <input
                type="text"
                placeholder="Search by name, email, or application number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-cardDark border border-border dark:border-borderDark rounded-lg text-foreground dark:text-foregroundDark placeholder:text-foregroundMuted dark:placeholder:text-foregroundMutedDark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark"
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-cardDark text-foreground dark:text-foregroundDark rounded-lg hover:bg-border dark:hover:bg-borderDark transition-colors duration-200"
            >
              <Filter size={16} />
              Filters
              {(filter || searchTerm) && (
                <span className="h-2 w-2 bg-primary rounded-full" />
              )}
            </motion.button>

            {/* Clear Filters */}
            {(filter || searchTerm) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className="px-4 py-2 text-error dark:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20 rounded-lg transition-colors"
              >
                Clear
              </motion.button>
            )}
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setFilter('');
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      filter === ''
                        ? 'bg-primary text-white'
                        : 'bg-surface text-foreground hover:bg-border'
                    }`}
                  >
                    All
                  </button>
                  {['submitted', 'under_review', 'documents_requested', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                        filter === status
                          ? 'bg-primary text-white'
                          : 'bg-surface text-foreground hover:bg-border'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Sort Options */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-cardDark border border-border dark:border-borderDark rounded-lg text-sm text-foreground dark:text-foregroundDark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark"
                  >
                    <option value="createdAt">Date Applied</option>
                    <option value="loanAmount">Loan Amount</option>
                    <option value="user.fullName">Customer Name</option>
                    <option value="status">Status</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-surface rounded-lg hover:bg-border transition-colors"
                  >
                    <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Applications Table */}
        <div className="card">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-foregroundSecondary mb-4" size={48} />
              <p className="text-foregroundSecondary">No applications found</p>
            </div>
          ) : (
            <>
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="space-y-4"
              >
                {applications.map((app) => (
                  <motion.div key={app._id} variants={staggerItem}>
                    <Link
                      to={`/admin/applications/${app._id}`}
                      className="block p-6 rounded-xl border border-border dark:border-borderDark hover:border-primary dark:hover:border-primaryDark hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 dark:bg-primaryDark/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="text-primary dark:text-primaryDark" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">
                                  {app.user?.fullName}
                                </h3>
                                <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                                  {app.user?.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={app.status} />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleDeleteClick(e, app)}
                                  className="p-2 text-error dark:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20 rounded-lg transition-colors duration-200"
                                  title="Delete application"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              </div>
                            </div>
                            <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mb-2">
                              {app.applicationNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Loan Type</p>
                          <p className="font-semibold text-foreground dark:text-foregroundDark">{app.loanType?.name}</p>
                        </div>
                        <div>
                          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Amount</p>
                          <p className="font-semibold text-foreground dark:text-foregroundDark">
                            ₹{app.loanAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Duration</p>
                          <p className="font-semibold text-foreground dark:text-foregroundDark">
                            {app.durationMonths} months
                          </p>
                        </div>
                        <div>
                          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Applied</p>
                          <p className="font-semibold text-foreground dark:text-foregroundDark">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border dark:border-borderDark">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-foregroundSecondary">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && applicationToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-cardDark rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-errorBadge dark:bg-errorDark/30 rounded-full flex items-center justify-center">
                  <Trash2 className="text-error dark:text-errorDark" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground dark:text-foregroundDark">Delete Application</h3>
              </div>
              <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark mb-6">
                Are you sure you want to delete this application from <span className="font-semibold text-foreground dark:text-foregroundDark">{applicationToDelete.user?.fullName}</span>? This will permanently remove the application and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setApplicationToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-input dark:bg-cardDark text-foreground dark:text-foregroundDark rounded-lg hover:bg-border dark:hover:bg-borderDark transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-error dark:bg-errorDark text-white rounded-lg hover:bg-error/90 dark:hover:bg-errorDark/90 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplications;
