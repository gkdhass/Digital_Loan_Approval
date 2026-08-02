import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toastVariants } from '../animations/variants';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-600'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-amber-50 border-amber-200 text-amber-800',
      iconColor: 'text-amber-600'
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600'
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
