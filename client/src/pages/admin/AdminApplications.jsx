import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [filter, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/admin/all', {
        params: { status: filter || undefined, page: currentPage, limit: 10 },
      });
      setApplications(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
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

        {/* Filters */}
        <div className="card mb-6">
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
