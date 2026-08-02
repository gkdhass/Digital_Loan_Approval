import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter, currentPage, searchTerm, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
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
      setApplications(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
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

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-navy-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonTable rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            All Applications
          </h1>
          <p className="text-navy-600">Review and manage loan applications</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or application number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors"
            >
              <Filter size={16} />
              Filters
              {(filter || searchTerm) && (
                <span className="h-2 w-2 bg-accent-600 rounded-full" />
              )}
            </motion.button>

            {/* Clear Filters */}
            {(filter || searchTerm) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setFilter('');
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      filter === ''
                        ? 'bg-accent-600 text-white'
                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
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
                          ? 'bg-accent-600 text-white'
                          : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Sort Options */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                    className="p-2 bg-navy-100 rounded-lg hover:bg-navy-200 transition-colors"
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
              <FileText className="mx-auto text-navy-300 mb-4" size={48} />
              <p className="text-navy-600">No applications found</p>
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
                      className="block p-6 rounded-xl border border-navy-200 hover:border-accent-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="text-accent-600" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-navy-900">
                                  {app.user?.fullName}
                                </h3>
                                <p className="text-sm text-navy-600">
                                  {app.user?.email}
                                </p>
                              </div>
                              <StatusBadge status={app.status} />
                            </div>
                            <p className="text-sm text-navy-600 mb-2">
                              {app.applicationNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-navy-600">Loan Type</p>
                          <p className="font-semibold text-navy-900">{app.loanType?.name}</p>
                        </div>
                        <div>
                          <p className="text-navy-600">Amount</p>
                          <p className="font-semibold text-navy-900">
                            ₹{app.loanAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-navy-600">Duration</p>
                          <p className="font-semibold text-navy-900">
                            {app.durationMonths} months
                          </p>
                        </div>
                        <div>
                          <p className="text-navy-600">Applied</p>
                          <p className="font-semibold text-navy-900">
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
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-navy-200">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-navy-600">
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
    </div>
  );
};

export default AdminApplications;
