import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import { pageVariants, cardVariants } from '../animations/variants';
import { applicationsAPI, formatCurrency, formatDate } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import StatusBadge from '../components/StatusBadge';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getUserApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <SkeletonLoader type="card" count={3} />
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
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track and manage your loan applications
          </p>
        </div>
        <Link
          to="/loan-types"
          className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-accent-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app._id}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <Link
                to={`/applications/${app._id}`}
                className="card p-6 block hover:shadow-soft-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-accent-50 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">
                        {app.loanType?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.applicationNumber}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Loan Amount</p>
                    <p className="font-semibold text-navy-900">
                      {formatCurrency(app.loanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">EMI</p>
                    <p className="font-semibold text-navy-900">
                      {formatCurrency(app.emi)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold text-navy-900">
                      {app.durationMonths} months
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Applied On</p>
                    <p className="font-semibold text-navy-900">
                      {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't applied for any loans yet"
              : `No applications with status: ${filter.replace('_', ' ')}`
            }
          </p>
          <Link
            to="/loan-types"
            className="inline-block px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Apply for a Loan
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default Applications;
