import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Car, GraduationCap, Briefcase, Coins, Wheat, Building, User, ArrowRight } from 'lucide-react';
import { pageVariants, cardVariants, staggerContainer } from '../animations/variants';
import { loanTypesAPI, formatCurrency } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  'home': Home,
  'car': Car,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'coins': Coins,
  'wheat': Wheat,
  'building': Building,
  'user': User
};

const LoanTypes = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      // NOTE: The axios interceptor returns response.data (the HTTP body), so
      // `response` here is already { success, count, data: [...] }.
      // The actual array lives at response.data, NOT response.data.data.
      const response = await loanTypesAPI.getAll();
      const list = Array.isArray(response.data) ? response.data : [];
      setLoanTypes(list);
    } catch (err) {
      console.error('Failed to fetch loan types:', err);
      setError(err?.message || 'Failed to load loan types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Failed to load loan types</h2>
          <p className="text-secondary mb-6">{error}</p>
          <button
            onClick={fetchLoanTypes}
            className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
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
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
          Choose Your Loan Type
        </h1>
        <p className="text-xl text-secondary">
          We offer flexible loan solutions tailored to your needs
        </p>
      </div>

      {loanTypes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-secondary text-lg">No loan types available at the moment.</p>
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loanTypes.map((loanType, index) => {
          const Icon = iconMap[loanType.icon] || User;
          
          return (
            <motion.div
              key={loanType._id}
              variants={cardVariants}
              custom={index}
              whileHover="hover"
              className="card-interactive p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-heading">
                    {loanType.interestRate}%
                  </p>
                  <p className="text-xs text-secondary">Interest Rate</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-primary mb-2">
                {loanType.name}
              </h3>
              <p className="text-secondary mb-4 line-clamp-2">
                {loanType.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Max Amount</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(loanType.maxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Min Income</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(loanType.minIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Max Duration</span>
                  <span className="font-semibold text-primary">
                    {loanType.maxDurationMonths} months
                  </span>
                </div>
              </div>

              <Link
                to={isAuthenticated ? `/apply-loan/${loanType._id}` : '/login'}
                className="block w-full px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default LoanTypes;
