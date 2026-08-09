import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pageVariants, buttonVariants } from '../animations/variants';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' or 'admin'
  const [sessionMessage, setSessionMessage] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
  
  // Check for session expired message
  useEffect(() => {
    const authMessage = sessionStorage.getItem('authMessage');
    if (authMessage) {
      setSessionMessage(authMessage);
      sessionStorage.removeItem('authMessage');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleToggle = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      const userRole = response.data.user.role;

      // Verify the logged-in user's role matches the selected tab
      if (selectedRole === 'admin' && userRole !== 'admin') {
        setError('This account is not an admin account. Please use Customer Login instead.');
        setLoading(false);
        return;
      }

      if (selectedRole === 'customer' && userRole === 'admin') {
        setError('This is an admin account. Please use Admin Login instead.');
        setLoading(false);
        return;
      }

      // Redirect based on actual server role (source of truth)
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl mb-4 shadow-soft">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">
            Welcome Back
          </h2>
          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
            Sign in to continue to your account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          {/* Role Selector Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-input dark:bg-cardDark rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleToggle('customer')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedRole === 'customer'
                    ? 'bg-gradient-to-r from-primary to-primaryHover text-white shadow-md dark:from-primaryDark dark:to-primaryHoverDark'
                    : 'text-foregroundSecondary dark:text-foregroundSecondaryDark hover:text-foreground dark:hover:text-foregroundDark hover:bg-input dark:hover:bg-cardElevatedDark'
                }`}
              >
                Customer Login
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('admin')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-primary to-primaryHover text-white shadow-md dark:from-primaryDark dark:to-primaryHoverDark'
                    : 'text-foregroundSecondary dark:text-foregroundSecondaryDark hover:text-foreground dark:hover:text-foregroundDark hover:bg-input dark:hover:bg-cardElevatedDark'
                }`}
              >
                Admin Login
              </button>
            </div>
          </div>

          {sessionMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-warning dark:text-warningDark flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warningText dark:text-warningTextDark">{sessionMessage}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-errorBadge text-errorText border border-errorBorder dark:bg-errorBadgeDark dark:text-errorTextDark dark:border-errorBorderDark rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-error dark:text-errorDark flex-shrink-0 mt-0.5" />
              <p className="text-sm text-errorText dark:text-errorTextDark">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground dark:text-foregroundDark mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground dark:text-foregroundDark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground dark:text-foregroundDark">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-medium transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </motion.button>
          </form>

          {/* Show Sign Up link only for Customer Login */}
          {selectedRole === 'customer' && (
            <div className="mt-6 text-center">
              <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-semibold transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
