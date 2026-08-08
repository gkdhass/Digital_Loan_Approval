import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, DollarSign, FileText, Clock, 
  ArrowRight, CheckCircle 
} from 'lucide-react';
import { pageVariants, cardVariants, kpiCardVariants } from '../animations/variants';
import { dashboardAPI, formatCurrency } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useCountUp from '../hooks/useCountUp';
import { SkeletonKPI, SkeletonList } from '../components/ui/Skeleton';
import StatusBadge from '../components/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const animatedValue = useCountUp(value, 1000);

  return (
    <motion.div
      variants={kpiCardVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <h4 className="text-sm font-semibold text-foregroundSecondary">{label}</h4>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay * 0.1 + 0.3 }}
        className={`text-2xl font-bold ${color}`}
      >
        {typeof value === 'number' ? animatedValue : value}
      </motion.p>
    </motion.div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getUserDashboard();
      // Interceptor unwraps HTTP body → response = {success, data:{...}}
      setDashboardData(response.data || null);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err?.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="h-8 bg-surface dark:bg-surfaceDark rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-surface dark:bg-surfaceDark rounded w-1/4 animate-pulse" />
        </div>
        
        {/* Skeleton KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKPI key={i} />
          ))}
        </div>

        {/* Skeleton Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SkeletonKPI className="h-48" />
          <SkeletonKPI className="h-48" />
        </div>

        {/* Skeleton Applications List */}
        <SkeletonList items={3} />
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
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load dashboard</h2>
          <p className="text-foregroundSecondary mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safely extract data with proper null checks
  const overview = dashboardData?.overview || {};
  const loanStats = dashboardData?.loanStats || {};
  const recentApplications = Array.isArray(dashboardData?.recentApplications) 
    ? dashboardData.recentApplications 
    : [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container-custom py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-foregroundSecondary dark:text-foregroundSecondary">
          Here's your loan application overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={overview.totalApplications || 0}
          color="text-primary"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Pending Applications"
          value={overview.pendingApplications || 0}
          color="text-warning"
          delay={1}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved Loans"
          value={overview.approvedApplications || 0}
          color="text-success"
          delay={2}
        />
        <StatCard
          icon={DollarSign}
          label="Total EMI/Month"
          value={formatCurrency(loanStats.totalEMI || 0)}
          color="text-accent"
          delay={3}
        />
      </div>

      {/* Loan Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">Loan Summary</h3>
            <TrendingUp className="h-5 w-5 text-foreground dark:text-foregroundSecondaryDark" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">Total Requested</p>
              <p className="text-2xl font-bold text-foreground dark:text-foregroundDark">
                {formatCurrency(loanStats.totalRequested || 0)}
              </p>
            </div>
            <div className="h-px bg-border dark:bg-foregroundDark" />
            <div>
              <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">Total Approved</p>
              <p className="text-2xl font-bold text-success dark:text-successDark">
                {formatCurrency(loanStats.totalApproved || 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="bg-gradient-to-br from-primary to-primaryDarkMode rounded-2xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/loan-types"
              className="block p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Apply for New Loan</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
            <Link
              to="/applications"
              className="block p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">View All Applications</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">Recent Applications</h3>
          <Link
            to="/applications"
            className="text-sm text-foreground dark:text-foregroundSecondaryDark hover:text-foreground dark:hover:text-foregroundSecondary font-semibold flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/applications/${app._id}`}
                  className="block p-4 border border-border dark:border-borderDark dark:border-foregroundDark rounded-xl hover:border-secondary dark:hover:border-secondary hover:bg-secondary/50 dark:hover:bg-secondaryDark/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary dark:bg-secondaryDark/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-foreground dark:text-foregroundSecondaryDark" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground dark:text-foregroundDark">
                          {app.loanType?.name}
                        </p>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary">
                          {app.applicationNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foregroundSecondary dark:text-foregroundSecondary">
                      Amount: <span className="font-semibold text-foreground dark:text-foregroundDark">
                        {formatCurrency(app.loanAmount)}
                      </span>
                    </span>
                    <span className="text-foregroundSecondary dark:text-foregroundSecondary">
                      EMI: <span className="font-semibold text-foreground dark:text-foregroundDark">
                        {formatCurrency(app.emi)}
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <FileText className="h-12 w-12 text-foregroundSecondary dark:text-foregroundSecondary mx-auto mb-3" />
            <p className="text-foregroundSecondary dark:text-foregroundSecondary mb-4">No applications yet</p>
            <Link
              to="/loan-types"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-background text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Apply for Your First Loan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
