import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import api from '../../services/api';
import { pageVariants, cardVariants } from '../../animations/variants';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { useToast } from '../../hooks/useToast.jsx';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchTerm, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/audit-logs', {
        params: {
          page: currentPage,
          limit: 20,
          action: actionFilter || undefined,
          entityType: entityFilter || undefined,
        },
      });
      // Interceptor unwraps HTTP body → response = {success, data:[...], totalPages}
      setLogs(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError(err?.message || 'Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return 'text-red-600 bg-red-50';
    if (action.includes('create')) return 'text-emerald-600 bg-emerald-50';
    if (action.includes('update')) return 'text-blue-600 bg-blue-50';
    if (action.includes('verify')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50 dark:bg-cardSecondaryDark';
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'user':
        return <User size={16} />;
      case 'application':
        return <FileText size={16} />;
      case 'document':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonTable rows={20} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit Logs</h1>
          <p className="text-foregroundSecondary">Track all system activities and changes</p>
        </div>

        {/* Search and Filters */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-border transition-colors"
            >
              <Filter size={16} />
              Filters
              {(actionFilter || entityFilter) && (
                <span className="h-2 w-2 bg-primary-600 rounded-full" />
              )}
            </motion.button>

            {(actionFilter || entityFilter) && (
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

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex flex-wrap gap-3">
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="verify">Verify</option>
                </select>

                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Entities</option>
                  <option value="user">User</option>
                  <option value="application">Application</option>
                  <option value="document">Document</option>
                  <option value="loan_type">Loan Type</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Logs Table */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="card"
        >
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-foregroundSecondary mb-4" size={48} />
              <p className="text-foregroundSecondary">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Action</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Entity</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <motion.tr
                        key={log._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-border100 hover:bg-gray-50 dark:hover:bg-cardSecondaryDark"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-foreground">
                              {log.user?.fullName || 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            {getEntityIcon(log.entityType)}
                            <span className="capitalize">{log.entityType.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminAuditLogs;
