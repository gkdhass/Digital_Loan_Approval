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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    try {
      const response = await loanTypesAPI.getAll();
      setLoanTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container-custom py-8"
    >
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
          Choose Your Loan Type
        </h1>
        <p className="text-xl text-gray-600">
          We offer flexible loan solutions tailored to your needs
        </p>
      </div>

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
                  <p className="text-2xl font-bold text-accent-600">
                    {loanType.interestRate}%
                  </p>
                  <p className="text-xs text-gray-600">Interest Rate</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-navy-900 mb-2">
                {loanType.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {loanType.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Amount</span>
                  <span className="font-semibold text-navy-900">
                    {formatCurrency(loanType.maxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Income</span>
                  <span className="font-semibold text-navy-900">
                    {formatCurrency(loanType.minIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Duration</span>
                  <span className="font-semibold text-navy-900">
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
