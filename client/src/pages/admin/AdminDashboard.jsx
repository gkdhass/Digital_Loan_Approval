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
          <p className="text-sm text-navy-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-navy-900">
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 py-8">
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

  const stats = dashboard?.stats || {};
  const statusDistribution = dashboard?.statusDistribution || [];
  const loanTypeDistribution = dashboard?.loanTypeDistribution || [];
  const recentApplications = dashboard?.recentApplications || [];

  const COLORS = ['#059669', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Admin Dashboard</h1>
          <p className="text-navy-600">Overview of loan applications and system metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={stats.totalApplications || 0}
            color="bg-gradient-to-br from-blue-600 to-blue-500"
            delay={0}
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={stats.pendingApplications || 0}
            color="bg-gradient-to-br from-amber-600 to-amber-500"
            delay={0.1}
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={stats.approvedApplications || 0}
            color="bg-gradient-to-br from-emerald-600 to-emerald-500"
            delay={0.2}
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats.rejectedApplications || 0}
            color="bg-gradient-to-br from-red-600 to-red-500"
            delay={0.3}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={stats.totalCustomers || 0}
            color="bg-gradient-to-br from-purple-600 to-purple-500"
            delay={0.4}
          />
          <StatCard
            icon={DollarSign}
            label="Total Disbursed"
            value={stats.totalDisbursed || 0}
            color="bg-gradient-to-br from-accent-600 to-accent-500"
            delay={0.5}
          />
          <StatCard
            icon={AlertTriangle}
            label="Pending Documents"
            value={stats.pendingDocuments || 0}
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
            <h2 className="text-xl font-bold text-navy-900 mb-6">Status Distribution</h2>
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
              <p className="text-center text-navy-600 py-12">No data available</p>
            )}
          </motion.div>

          {/* Loan Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">Loan Type Distribution</h2>
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
              <p className="text-center text-navy-600 py-12">No data available</p>
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
            <h2 className="text-xl font-bold text-navy-900">Recent Applications</h2>
            <Link to="/admin/applications" className="text-accent-600 hover:text-accent-700 font-medium">
              View All
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-navy-300 mb-4" size={48} />
              <p className="text-navy-600">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <Link
                  key={app._id}
                  to={`/admin/applications/${app._id}`}
                  className="block p-4 rounded-xl border border-navy-200 hover:border-accent-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                        <FileText className="text-accent-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">
                          {app.user?.fullName}
                        </p>
                        <p className="text-sm text-navy-600">
                          {app.loanType?.name} • {app.applicationNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-600">
                      ₹{app.loanAmount.toLocaleString()} • {app.durationMonths}m
                    </span>
                    <span className="text-navy-500">
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
