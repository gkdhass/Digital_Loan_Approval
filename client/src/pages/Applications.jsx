import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import { pageVariants, tableRowVariants, staggerContainer } from '../animations/variants';
import { applicationsAPI, formatCurrency, formatDate } from '../services/api';
import { SkeletonList } from '../components/ui/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { useDebounce } from '../hooks/useDebounce';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsAPI.getUserApplications();
      // Interceptor unwraps HTTP body → response = {success, count, data:[...]}
      const list = Array.isArray(response.data) ? response.data : [];
      setApplications(list);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err?.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredApplications = useMemo(() => {
    const safeApplications = Array.isArray(applications) ? applications : [];
    
    // Apply status filter
    let filtered = filter === 'all'
      ? safeApplications
      : safeApplications.filter(app => app.status === filter);
    
    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationNumber?.toLowerCase().includes(searchLower) ||
        app.loanType?.name?.toLowerCase().includes(searchLower) ||
        app.status?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [applications, filter, debouncedSearch]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="h-8 bg-surface dark:bg-surfaceDark rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-surface dark:bg-surfaceDark rounded w-1/4 animate-pulse" />
        </div>
        <SkeletonList items={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="h-16 w-16 bg-errorBadge dark:bg-errorBadgeDark rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error dark:text-errorDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load applications</h2>
          <p className="text-foregroundSecondary mb-6">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Retry
          </button>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">
            My Applications
          </h1>
          <p className="text-foregroundSecondary dark:text-foregroundSecondary">
            Track and manage your loan applications
          </p>
        </div>
        <Link
          to="/loan-types"
          className="px-6 py-3 bg-primary dark:bg-primaryDark hover:bg-primaryHover dark:hover:bg-primaryHoverDark text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        >
          New Application
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
          <input
            type="text"
            placeholder="Search by application number, loan type, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-cardDark border border-border dark:border-borderDark rounded-xl text-foreground dark:text-foregroundDark placeholder:text-foregroundSecondary dark:placeholder:text-foregroundSecondaryDark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foregroundSecondary hover:text-foreground dark:text-foregroundSecondaryDark dark:hover:text-foregroundDark"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary text-white shadow-md dark:bg-primaryDark dark:text-foregroundDark'
                : 'bg-white dark:bg-cardElevatedDark border border-border dark:border-borderDark text-foregroundSecondary dark:text-foregroundSecondaryDark hover:bg-input dark:hover:bg-cardDark'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <motion.div 
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app._id}
              variants={tableRowVariants}
              custom={index}
            >
              <Link
                to={`/applications/${app._id}`}
                className="card block hover:shadow-soft-lg hover:border-primary dark:hover:border-primary transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="h-12 w-12 bg-secondary dark:bg-secondaryDark/20 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <FileText className="h-6 w-6 text-foreground dark:text-foregroundSecondaryDark" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">
                        {app.loanType?.name}
                      </h3>
                      <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">
                        {app.applicationNumber}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondaryDark mb-1">Loan Amount</p>
                    <p className="font-semibold text-foreground dark:text-foregroundDark">
                      {formatCurrency(app.loanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondaryDark mb-1">EMI</p>
                    <p className="font-semibold text-foreground dark:text-foregroundDark">
                      {formatCurrency(app.emi)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondaryDark mb-1">Duration</p>
                    <p className="font-semibold text-foreground dark:text-foregroundDark">
                      {app.durationMonths} months
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondaryDark mb-1">Applied On</p>
                    <p className="font-semibold text-foreground dark:text-foregroundDark">
                      {app.createdAt ? formatDate(app.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center"
        >
          <div className="py-12">
            <FileText className="h-16 w-16 text-foregroundSecondary dark:text-foregroundSecondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-2">
              {searchQuery ? 'No matching applications' : 'No applications found'}
            </h3>
            <p className="text-foregroundSecondary dark:text-foregroundSecondary mb-6">
              {searchQuery ? (
                <>Clear your search or try different keywords</>
              ) : filter === 'all' ? (
                <>You haven't applied for any loans yet</>
              ) : (
                <>No applications with status: {filter.replace('_', ' ')}</>
              )}
            </p>
            {!searchQuery && (
              <Link
                to="/loan-types"
                className="inline-block px-6 py-3 bg-secondary hover:bg-background text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Apply for a Loan
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Applications;
