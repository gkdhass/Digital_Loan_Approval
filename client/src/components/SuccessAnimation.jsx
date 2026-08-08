import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { successCheckVariants, circleExpansionVariants } from '../animations/variants';

const SuccessAnimation = ({ title = 'Success!', message, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-backgroundDark/80 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="bg-white dark:bg-surfaceDark rounded-2xl p-8 max-w-md mx-4 text-center shadow-xl"
      >
        {/* Success Circle with Checkmark */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          {/* Background Circle */}
          <motion.div
            variants={circleExpansionVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 bg-success-100 dark:bg-success-900/20 rounded-full"
          />

          {/* Success Icon Circle */}
          <motion.div
            variants={circleExpansionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="absolute inset-2 bg-success-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              variants={successCheckVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Check className="text-white" size={40} strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Outer Ring Animation */}
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 border-4 border-success-500 rounded-full"
          />
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-foreground dark:text-surfaceDark mb-2"
        >
          {title}
        </motion.h2>

        {/* Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-foregroundSecondary dark:text-foregroundSecondary"
          >
            {message}
          </motion.p>
        )}

        {/* Close Button */}
        {onComplete && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="mt-6 px-6 py-3 bg-secondary hover:bg-background text-white rounded-xl font-semibold transition-colors"
          >
            Continue
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SuccessAnimation;
