import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { badgeVariants } from '../animations/variants';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: {
      label: 'Submitted',
      icon: FileText,
      className: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
      iconColor: 'text-cyan-600 dark:text-cyan-400'
    },
    under_review: {
      label: '⏳ UNDER REVIEW',
      icon: Clock,
      className: 'bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark',
      iconColor: 'text-warning dark:text-warningDark'
    },
    documents_requested: {
      label: 'Documents Requested',
      icon: AlertCircle,
      className: 'bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark',
      iconColor: 'text-warning dark:text-warningDark'
    },
    approved: {
      label: '✓ APPROVED',
      icon: CheckCircle,
      className: 'bg-successBadge text-successText border border-successBorder dark:bg-successBadgeDark dark:text-successTextDark dark:border-successBorderDark',
      iconColor: 'text-success dark:text-successDark'
    },
    rejected: {
      label: '✕ REJECTED',
      icon: XCircle,
      className: 'bg-errorBadge text-errorText border border-errorBorder dark:bg-errorBadgeDark dark:text-errorTextDark dark:border-errorBorderDark',
      iconColor: 'text-error dark:text-errorDark'
    },
    disbursed: {
      label: 'Disbursed',
      icon: DollarSign,
      className: 'bg-successBadge text-successText border border-successBorder dark:bg-successBadgeDark dark:text-successTextDark dark:border-successBorderDark',
      iconColor: 'text-success dark:text-successDark'
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark',
      iconColor: 'text-warning dark:text-warningDark'
    },
    verified: {
      label: '✓ APPROVED',
      icon: CheckCircle,
      className: 'bg-successBadge text-successText border border-successBorder dark:bg-successBadgeDark dark:text-successTextDark dark:border-successBorderDark',
      iconColor: 'text-success dark:text-successDark'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.div
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-sm ${config.className}`}
    >
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <span>{config.label}</span>
    </motion.div>
  );
};

export default StatusBadge;
