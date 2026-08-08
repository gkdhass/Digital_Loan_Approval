import { motion } from 'framer-motion';

const PremiumLoader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Spinner */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-border dark:border-borderDark dark:border-foregroundDark`}
        />
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-secondary absolute inset-0`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Loading Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-foregroundSecondary dark:text-foregroundSecondary text-sm font-medium"
        >
          {message}
        </motion.p>
      )}

      {/* Animated Dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-secondary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PremiumLoader;
