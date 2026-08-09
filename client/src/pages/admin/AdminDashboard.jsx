import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonStat } from '../../components/SkeletonLoader';
import { useCountUp } from '../../hooks/useCountUp';
import { staggerContainer, staggerItem } from '../../animations/variants';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => {
  const animatedValue = useCountUp(value, 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground dark:text-foregroundDark">
            {label.includes('Amount') || label.includes('Disbursed')
              ? `₹${(animatedValue / 100000).toFixed(1)}L`
              : animatedValue}
          </p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/admin');
      // Interceptor unwraps HTTP body → response = {success, data:{...}}
      console.log('[AdminDashboard] RAW API RESPONSE:', response);
      setDashboard(response.data || null);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err?.message || 'Failed to load admin dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonStat key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="h-16 w-16 bg-error-50 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load admin dashboard</h2>
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

  const overview = dashboard?.overview || {};
  const loanStats = dashboard?.loanStats || {};
  const statusDistribution = Array.isArray(dashboard?.applicationsByStatus)
    ? Object.entries(dashboard.applicationsByStatus).map(([status, count]) => ({ _id: status, count }))
    : [];
  const loanTypeDistribution = Array.isArray(dashboard?.applicationsByLoanType)
    ? dashboard.applicationsByLoanType
    : [];
  const recentApplications = Array.isArray(dashboard?.recentApplications)
    ? dashboard.recentApplications
    : [];

  const COLORS = ['#16A34A', '#F59E0B', '#0E7490', '#DC2626', '#EAB308'];

  return (
    <div className="min-h-screen bg-background dark:bg-backgroundDark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">Admin Dashboard</h1>
          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Overview of loan applications and system metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={overview.totalApplications || 0}
            color="bg-gradient-to-br from-primary to-primaryDark"
            delay={0}
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={overview.pendingApplications || 0}
            color="bg-gradient-to-br from-warning to-warningDark"
            delay={0.1}
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={overview.approvedApplications || 0}
            color="bg-gradient-to-br from-success to-successDark"
            delay={0.2}
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={overview.rejectedApplications || 0}
            color="bg-gradient-to-br from-error to-errorDark"
            delay={0.3}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={overview.totalUsers || 0}
            color="bg-gradient-to-br from-accent to-accent"
            delay={0.4}
          />
          <StatCard
            icon={DollarSign}
            label="Total Disbursed"
            value={loanStats.totalDisbursed || 0}
            color="bg-gradient-to-br from-primary to-primaryHover"
            delay={0.5}
          />
          <StatCard
            icon={AlertTriangle}
            label="Pending Documents"
            value={overview.pendingDocuments || 0}
            color="bg-gradient-to-br from-orange-600 to-orange-500"
            delay={0.6}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-6">Status Distribution</h2>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry._id}: ${entry.count}`}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-foregroundSecondary py-12">No data available</p>
            )}
          </motion.div>

          {/* Loan Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-6">Loan Type Distribution</h2>
            {loanTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loanTypeDistribution}>
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-foregroundSecondary py-12">No data available</p>
            )}
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground dark:text-foregroundDark">Recent Applications</h2>
            <Link to="/admin/applications" className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-medium transition-colors duration-200">
              View All
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-foregroundSecondary mb-4" size={48} />
              <p className="text-foregroundSecondary">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <Link
                  key={app._id}
                  to={`/admin/applications/${app._id}`}
                  className="block p-4 rounded-xl border border-border dark:border-borderDark hover:border-primary dark:hover:border-primaryDark hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 dark:bg-primaryDark/20 rounded-xl flex items-center justify-center">
                        <FileText className="text-primary dark:text-primaryDark" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground dark:text-foregroundDark">
                          {app.user?.fullName}
                        </p>
                        <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                          {app.loanType?.name} • {app.applicationNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
                      ₹{app.loanAmount.toLocaleString()} • {app.durationMonths}m
                    </span>
                    <span className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
