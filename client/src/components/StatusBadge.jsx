import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { badgeVariants } from '../animations/variants';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: {
      label: 'Submitted',
      icon: FileText,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600'
    },
    under_review: {
      label: 'Under Review',
      icon: Clock,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600'
    },
    documents_requested: {
      label: 'Documents Requested',
      icon: AlertCircle,
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600'
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600'
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-600'
    },
    disbursed: {
      label: 'Disbursed',
      icon: DollarSign,
      className: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-600'
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-600'
    },
    verified: {
      label: 'Verified',
      icon: CheckCircle,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600'
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
