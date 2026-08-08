import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, FileText, Calendar, Download } from 'lucide-react';
import api from '../../services/api';
import { pageVariants, cardVariants } from '../../animations/variants';
import { useToast } from '../../hooks/useToast.jsx';

const COLORS = ['#059669', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('6m');
  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      console.log('[AdminReports] Fetching reports with period:', period);
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/reports', { params: { period } });
      console.log('[AdminReports] API response:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });
      // Interceptor unwraps HTTP body → response = {success, data:{...}}
      setReports(response.data || null);
    } catch (err) {
      console.error('[AdminReports] FAILED to fetch reports:', {
        error: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
      });
      setError(err?.message || 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      console.log('[AdminReports] Export button clicked, period:', period);
      const response = await api.get('/admin/reports/export', {
        params: { period },
        responseType: 'blob'
      });
      console.log('[AdminReports] Export API response received, blob size:', response.data?.size);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-reports-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log('[AdminReports] CSV download triggered successfully');
      showToast('Report exported successfully', 'success');
    } catch (err) {
      console.error('[AdminReports] FAILED to export reports:', {
        error: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
      });
      showToast('Failed to export report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-100 dark:bg-cardDark rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-cardDark rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Failed to load reports</h2>
            <p className="text-foregroundSecondary mb-6">{error}</p>
            <button
              onClick={fetchReports}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safely extract arrays with proper type checking
  const applicationTrends = Array.isArray(reports?.applicationTrends) 
    ? reports.applicationTrends 
    : [];
  const loanTypePerformance = Array.isArray(reports?.loanTypePerformance) 
    ? reports.loanTypePerformance 
    : [];
  const topUsers = Array.isArray(reports?.topUsers) 
    ? reports.topUsers 
    : [];
  const processingTimes = reports?.processingTimes || {};

  const periodLabels = {
    '1m': 'Last Month',
    '3m': 'Last 3 Months',
    '6m': 'Last 6 Months',
    '1y': 'Last Year',
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
            <p className="text-foregroundSecondary">Comprehensive insights into loan operations</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download size={16} />
              Export
            </motion.button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foregroundSecondary mb-2">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">
                  {applicationTrends.reduce((sum, t) => sum + (t.totalApplications || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foregroundSecondary mb-2">Approved Amount</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ₹{(applicationTrends.reduce((sum, t) => sum + (t.approvedAmount || 0), 0) / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foregroundSecondary mb-2">Avg Processing Time</p>
                <p className="text-3xl font-bold text-foreground">
                  {processingTimes.avgProcessingDays?.toFixed(1) || 0}d
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={3}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foregroundSecondary mb-2">Active Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {topUsers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="text-orange-600" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Application Trends */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={4}
            className="card"
          >
            <h3 className="text-lg font-bold text-foreground mb-6">Application Trends</h3>
            {applicationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationTrends}>
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(value) => `${value.month}/${value.year}`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `Month: ${value.month}/${value.year}`}
                    formatter={(value, name) => [value, name]}
                  />
                  <Bar dataKey="totalApplications" fill="#059669" name="Total" />
                  <Bar dataKey="approvedApplications" fill="#3B82F6" name="Approved" />
                  <Bar dataKey="rejectedApplications" fill="#EF4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-foregroundSecondary py-12">No data available</p>
            )}
          </motion.div>

          {/* Loan Type Performance */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={5}
            className="card"
          >
            <h3 className="text-lg font-bold text-foreground mb-6">Loan Type Performance</h3>
            {loanTypePerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={loanTypePerformance}
                    dataKey="totalApplications"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry._id}: ${entry.totalApplications}`}
                  >
                    {loanTypePerformance.map((entry, index) => (
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
        </div>

        {/* Loan Type Details Table */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={6}
          className="card"
        >
          <h3 className="text-lg font-bold text-foreground mb-6">Loan Type Breakdown</h3>
          {loanTypePerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Loan Type</th>
                    <th className="text-right py-4 px-4 font-semibold text-foreground">Total</th>
                    <th className="text-right py-4 px-4 font-semibold text-foreground">Approved</th>
                    <th className="text-right py-4 px-4 font-semibold text-foreground">Rejected</th>
                    <th className="text-right py-4 px-4 font-semibold text-foreground">Approval Rate</th>
                    <th className="text-right py-4 px-4 font-semibold text-foreground">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {loanTypePerformance.map((type, index) => (
                    <motion.tr
                      key={type._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border100 hover:bg-gray-50 dark:bg-cardSecondaryDark"
                    >
                      <td className="py-4 px-4 font-medium text-foreground">{type._id}</td>
                      <td className="py-4 px-4 text-right">{type.totalApplications}</td>
                      <td className="py-4 px-4 text-right text-emerald-600">{type.approvedApplications}</td>
                      <td className="py-4 px-4 text-right text-red-600">{type.rejectedApplications}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {type.approvalRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">{type.avgEligibilityScore}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-foregroundSecondary py-12">No data available</p>
          )}
        </motion.div>

        {/* Top Users */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={7}
          className="card mt-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-6">Top Users by Applications</h3>
          {topUsers.length > 0 ? (
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-cardSecondaryDark rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.fullName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Applications</p>
                      <p className="font-bold text-foreground">{user.applicationCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-primary-600">₹{(user.totalAmount / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-foregroundSecondary py-12">No data available</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminReports;
