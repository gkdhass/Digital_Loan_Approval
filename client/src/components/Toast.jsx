import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toastVariants } from '../animations/variants';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-successBadge border-successBorder text-successText dark:bg-successBadgeDark dark:border-successBorderDark dark:text-successTextDark',
      iconColor: 'text-success dark:text-successDark'
    },
    error: {
      icon: XCircle,
      className: 'bg-errorBadge border-errorBorder text-errorText dark:bg-errorBadgeDark dark:border-errorBorderDark dark:text-errorTextDark',
      iconColor: 'text-error dark:text-errorDark'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-warningBadge border-warningBorder text-warningText dark:bg-warningBadgeDark dark:border-warningBorderDark dark:text-warningTextDark',
      iconColor: 'text-warning dark:text-warningDark'
    },
    info: {
      icon: Info,
      className: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/20 dark:text-accent-300 dark:border-accent-800',
      iconColor: 'text-accent dark:text-accentDarkMode'
    }
  };

  const settings = config[type] || config.info;
  const Icon = settings.icon;

  // Auto close
  if (duration && onClose) {
    setTimeout(onClose, duration);
  }

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-soft-lg ${settings.className} min-w-[320px] max-w-md`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${settings.iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
