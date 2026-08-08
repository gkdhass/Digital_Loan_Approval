import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

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

    // Progress bar animation - 8 seconds total
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.25; // 100% / 80 updates (8 seconds * 10 updates per second)
      });
    }, 100);

    // Navigate to home after 8 seconds
    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      setShowSplash(false);
      navigate('/');
    }, 8000);

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
        theme === 'dark' 
          ? 'bg-backgroundDark' 
          : 'bg-background'
      }`}
      style={{
        background: theme === 'dark'
          ? 'radial-gradient(circle at center, #0D2233 0%, #071521 100%)'
          : 'radial-gradient(circle at center, #FFFFFF 0%, #F4F7F9 100%)'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mb-8"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div 
              className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
                theme === 'dark' 
                  ? 'bg-primaryDark opacity-40' 
                  : 'bg-primary opacity-20'
              }`}
              style={{
                filter: theme === 'dark' ? 'blur(30px)' : 'blur(20px)'
              }}
            ></div>
            
            <div className={theme === 'dark' ? 'animate-glow-pulse' : ''}>
              <Logo size="xl" showText={false} />
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
            theme === 'dark' ? 'bg-cardDark' : 'bg-border'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-primaryDark to-secondaryDark'
                  : 'bg-gradient-to-r from-primary to-secondary'
              }`}
              style={{
                filter: theme === 'dark' ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' : 'none'
              }}
            />
          </div>
          <p className={`text-xs mt-2 text-center ${
            theme === 'dark' ? 'text-foregroundSecondaryDark' : 'text-foregroundSecondary'
          }`}>
            Securing your session... {Math.round(progress)}%
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;