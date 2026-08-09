import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success dark:text-successDark" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-error dark:text-errorDark" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning dark:text-warningDark" />;
      default:
        return <Info className="h-5 w-5 text-accent dark:text-accentDark" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-successBadge border-successBorder text-successText dark:bg-successBadgeDark dark:border-successBorderDark dark:text-successTextDark';
      case 'error':
        return 'bg-errorBadge border-errorBorder text-errorText dark:bg-errorBadgeDark dark:border-errorBorderDark dark:text-errorTextDark';
      case 'warning':
        return 'bg-warningBadge border-warningBorder text-warningText dark:bg-warningBadgeDark dark:border-warningBorderDark dark:text-warningTextDark';
      default:
        return 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/20 dark:text-accent-300 dark:border-accent-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${getColors()}`}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Make addToast available globally
    window.showToast = addToast;
    
    return () => {
      delete window.showToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
