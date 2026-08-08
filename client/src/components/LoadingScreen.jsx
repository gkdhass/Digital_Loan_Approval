import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LoadingScreen = ({ fullScreen = true, message = 'Loading...' }) => {
  const { isDark } = useTheme();

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      {/* Background Glow Effects */}
      {fullScreen && (
        <>
          {/* Radial gradient glow centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-success-300/10 rounded-full blur-3xl" />
          </div>
          
          {/* Drifting circles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-success-300/10 rounded-full blur-2xl pointer-events-none"
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"
            animate={{
              x: [0, -20, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      <div className="flex flex-col items-center relative z-10">
        {/* 3D Rotating Card */}
        <motion.div
          className="relative w-[340px] h-[200px] mb-8"
          style={{
            perspective: 1000,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card with 3D rotation and float */}
          <motion.div
            className="relative w-full h-full rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateY: [-15, 15, -15],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* Cycling edge highlight glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(212, 175, 55, 0.5)',
                  '0 0 25px rgba(134, 239, 172, 0.5)',
                  '0 0 20px rgba(212, 175, 55, 0.5)',
                ],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Glossy diagonal shine sweep */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Card Content */}
            <div className="relative z-10 h-full p-6 flex flex-col justify-between">
              {/* Chip in upper-left */}
              <div className="w-[30px] h-[24px] bg-gradient-to-br from-secondary to-primary rounded-sm opacity-80" />

              {/* Center Logo/Icon */}
              <div className="flex items-center justify-center">
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Loan Symbol - Dollar Sign */}
                  <motion.div
                    className="text-6xl font-bold text-foregroundSecondary"
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ₹
                  </motion.div>
                </motion.div>
              </div>

              {/* App wordmark in lower-left */}
              <div className="text-left">
                <motion.div
                  className="text-sm font-semibold text-foregroundSecondary opacity-70"
                  animate={{
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  LoanApproval
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* App Name & Progress */}
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            LoanApproval
          </motion.h2>
          <motion.p
            className="text-sm text-foregroundSecondary mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {message}
          </motion.p>

          {/* Animated Progress Dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-secondary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Loading Spinner variant (smaller, for in-page use)
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-4 border-secondary border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default LoadingScreen;
