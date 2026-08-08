import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    
    if (hasShownSplash) {
      setShowSplash(false);
      // Don't force redirect - let normal routing handle authentication
      return;
    }

    // Mark splash as shown
    sessionStorage.setItem('hasShownSplash', 'true');

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3.33; // 100% / 30 seconds = ~3.33% per second
      });
    }, 1000);

    // Navigate to login after 30 seconds
    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      setShowSplash(false);
      navigate('/login');
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  if (!showSplash) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        theme === 'dark' ? 'bg-backgroundDark' : 'bg-background'
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        {/* Logo Container with Red Glow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mb-8"
        >
          <div className="relative">
            {/* Red Glow Effect */}
            <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-30 animate-pulse"></div>
            
            {/* Logo Placeholder - Replace with actual logo */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-primary to-primaryDark rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-bold text-white">L</span>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`text-4xl md:text-5xl font-bold mb-3 ${
            theme === 'dark' ? 'text-foregroundDark' : 'text-foreground'
          }`}
        >
          DIGITAL LOAN APPROVAL
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={`text-lg md:text-xl ${
            theme === 'dark' ? 'text-foregroundSecondaryDark' : 'text-foregroundSecondary'
          }`}
        >
          SECURE YOUR HOME TODAY
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="w-64 mt-12"
        >
          <div className={`h-1 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-cardDark' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className={`text-xs mt-2 text-center ${
            theme === 'dark' ? 'text-foregroundSecondaryDark' : 'text-foregroundSecondary'
          }`}>
            Loading... {Math.round(progress)}%
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;