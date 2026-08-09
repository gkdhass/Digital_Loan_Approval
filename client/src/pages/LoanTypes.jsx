import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Car, GraduationCap, Briefcase, Coins, Wheat, Building, User, ArrowRight } from 'lucide-react';
import { pageVariants, cardVariants, staggerContainer } from '../animations/variants';
import { loanTypesAPI, formatCurrency } from '../services/api';
import { SkeletonGrid } from '../components/ui/Skeleton';
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
      
      console.log('🔄 Fetching loan types from API...');
      
      // NOTE: The axios interceptor returns response.data (the HTTP body), so
      // `response` here is already { success, count, data: [...] }.
      // The actual array lives at response.data, NOT response.data.data.
      const response = await loanTypesAPI.getAll();
      
      console.log('📦 API Response:', response);
      console.log('   Success:', response.success);
      console.log('   Count:', response.count);
      console.log('   Data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('   Data length:', response.data?.length);
      
      const list = Array.isArray(response.data) ? response.data : [];
      
      if (list.length === 0) {
        console.warn('⚠️  No loan types returned from API');
        console.warn('   Check backend logs for database issues');
      } else {
        console.log(`✅ Loaded ${list.length} loan types`);
      }
      
      setLoanTypes(list);
    } catch (err) {
      console.error('❌ Failed to fetch loan types:');
      console.error('   Error:', err);
      console.error('   Message:', err?.message);
      console.error('   Response:', err?.response?.data);
      setError(err?.message || 'Failed to load loan types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="h-10 bg-surface dark:bg-surfaceDark rounded w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-surface dark:bg-surfaceDark rounded w-1/2 mx-auto animate-pulse" />
        </div>
        <SkeletonGrid items={6} columns={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="h-16 w-16 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load loan types</h2>
          <p className="text-foregroundSecondary mb-6">{error}</p>
          <button
            onClick={fetchLoanTypes}
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
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-foregroundDark mb-4">
          Choose Your Loan Type
        </h1>
        <p className="text-xl text-foregroundSecondary dark:text-foregroundSecondary">
          We offer flexible loan solutions tailored to your needs
        </p>
      </div>

      {loanTypes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-foregroundSecondary dark:text-foregroundSecondary text-lg">No loan types available at the moment.</p>
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
              className="card-interactive"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center text-white shadow-soft">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground dark:text-foregroundSecondaryDark">
                    {loanType.interestRate}%
                  </p>
                  <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary">Interest Rate</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-2">
                {loanType.name}
              </h3>
              <p className="text-foregroundSecondary dark:text-foregroundSecondary mb-4 line-clamp-2">
                {loanType.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-foregroundSecondary dark:text-foregroundSecondary">Max Amount</span>
                  <span className="font-semibold text-foreground dark:text-foregroundDark">
                    {formatCurrency(loanType.maxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foregroundSecondary dark:text-foregroundSecondary">Min Income</span>
                  <span className="font-semibold text-foreground dark:text-foregroundDark">
                    {formatCurrency(loanType.minIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foregroundSecondary dark:text-foregroundSecondary">Max Duration</span>
                  <span className="font-semibold text-foreground dark:text-foregroundDark">
                    {loanType.maxDurationMonths} months
                  </span>
                </div>
              </div>

              <Link
                to={isAuthenticated ? `/apply-loan/${loanType._id}` : '/login'}
                className="block w-full px-4 py-3 bg-secondary dark:bg-secondaryDark text-white rounded-xl font-semibold text-center hover:bg-secondary/90 dark:hover:bg-secondaryDark/90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Apply Now</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default LoanTypes;
