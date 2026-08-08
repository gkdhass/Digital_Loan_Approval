import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, FileText, Home, Calculator, Users, BarChart3, FileCheck, History, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { buttonSpring } from '../animations/springs';
import Notifications from './Notifications';
import Logo from './Logo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = isAuthenticated
    ? [
        { name: 'Dashboard', path: isAdmin ? '/admin/dashboard' : '/dashboard', icon: LayoutDashboard },
        ...(!isAdmin ? [
          { name: 'Loan Types', path: '/loan-types', icon: FileText },
          { name: 'EMI Calculator', path: '/emi-calculator', icon: Calculator },
          { name: 'My Applications', path: '/applications', icon: FileText },
          { name: 'Loan History', path: '/loan-history', icon: History },
        ] : []),
        ...(isAdmin ? [
          { name: 'Applications', path: '/admin/applications', icon: FileText },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Loan Types', path: '/admin/loan-types', icon: FileCheck },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
          { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        ] : [])
      ]
    : [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Loan Types', path: '/loan-types', icon: FileText },
        { name: 'EMI Calculator', path: '/emi-calculator', icon: Calculator }
      ];

  return (
    <nav className="bg-surface border-b border-border dark:border-borderDark sticky top-0 z-40 backdrop-blur-lg bg-surface/95 transition-colors duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo size="default" showText={false} />
            </motion.div>
            <span className="text-xl font-bold text-foreground dark:text-foregroundDark hidden sm:block">
              Digital Loan Approval
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-shrink">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive(item.path)
                      ? 'bg-[#123B5D] text-white dark:bg-[#38BDF8] dark:text-white'
                      : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-input dark:hover:bg-cardDark'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Theme Toggle */}
                <motion.button
                  {...buttonSpring}
                  onClick={toggleTheme}
                  className="p-2 text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark rounded-lg transition-colors"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  <AnimatePresence mode="wait">
                    {theme === 'light' ? (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Notifications */}
                <Notifications />

                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    {...buttonSpring}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-input dark:hover:bg-cardDark transition-colors"
                  >
                    <div className="h-8 w-8 bg-secondary dark:bg-secondary/30 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-foreground dark:text-foregroundDark">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground dark:text-foregroundDark max-w-[120px] truncate">
                      {user?.fullName}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-soft-lg border border-border dark:border-borderDark py-2"
                      >
                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin/dashboard');
                              setProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error dark:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-authenticated users */}
                <motion.button
                  {...buttonSpring}
                  onClick={toggleTheme}
                  className="p-2 text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark rounded-lg transition-colors"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </motion.button>
                
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground dark:text-foregroundDark hover:text-primary dark:hover:text-primaryDark transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-success-300 text-success-900 rounded-lg font-medium text-sm hover:bg-success-400 hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foregroundSecondary dark:text-foregroundSecondaryDark hover:bg-input dark:hover:bg-cardDark rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border dark:border-borderDark bg-surface"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap ${
                      isActive(item.path)
                        ? 'bg-[#123B5D] text-white dark:bg-[#38BDF8] dark:text-white'
                        : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-input dark:hover:bg-cardDark'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-error dark:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </button>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground dark:text-foregroundDark hover:bg-input dark:hover:bg-cardDark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-primary text-white rounded-lg font-medium text-sm text-center hover:bg-primaryHover dark:bg-primaryDark dark:hover:bg-primaryHoverDark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
