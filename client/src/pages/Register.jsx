import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pageVariants, buttonVariants } from '../animations/variants';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'fullName':
        if (value.trim().length < 3) {
          errors.fullName = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.fullName = 'Name can only contain letters and spaces';
        } else {
          delete errors.fullName;
        }
        break;
        
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'phone':
        const cleanPhone = value.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          errors.phone = 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
        } else {
          delete errors.phone;
        }
        break;
        
      case 'password':
        if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase and number';
        } else {
          delete errors.password;
        }
        
        // Also validate confirmPassword if it's already filled
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    
    // Validate field on change (debounced effect would be better in production)
    if (value) {
      validateField(name, value);
    } else {
      const errors = { ...fieldErrors };
      delete errors[name];
      setFieldErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    const newErrors = {};
    
    // Full Name
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters and spaces';
    }
    
    // Email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
    }
    
    // Password
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }
    
    // Confirm Password
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Set all errors at once
    setFieldErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the errors below before submitting');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h2>
          <p className="text-foregroundSecondary">
            Start your loan application journey today
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`input pl-11 ${fieldErrors.fullName ? 'input-error' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-error dark:text-errorDark text-sm mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

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
                  className={`input pl-11 ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-error dark:text-errorDark text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground dark:text-foregroundDark mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`input pl-11 ${fieldErrors.phone ? 'input-error' : ''}`}
                  placeholder="9876543210"
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-error dark:text-errorDark text-sm mt-1">{fieldErrors.phone}</p>
              )}
              <p className="text-xs text-foregroundMuted dark:text-foregroundMutedDark mt-1">
                Enter 10-digit mobile number (no country code needed)
              </p>
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
                  className={`input pl-11 ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-error dark:text-errorDark text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground dark:text-foregroundDark mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`input pl-11 ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-error dark:text-errorDark text-sm mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-border300 text-primary dark:text-primaryDark focus:ring-primary"
              />
              <label className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                I agree to the{' '}
                <Link to="/terms" className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary dark:text-primaryDark hover:text-primaryHover dark:hover:text-primaryHoverDark font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
