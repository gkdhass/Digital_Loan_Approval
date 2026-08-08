import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RiskAssessment = ({ riskAssessment }) => {
  if (!riskAssessment || riskAssessment.status === 'pending') {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-foregroundSecondary dark:text-foregroundSecondary">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Risk assessment pending - will be processed manually</span>
        </div>
      </div>
    );
  }

  if (riskAssessment.status === 'failed') {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-warning-600 dark:text-warning-400">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">Risk assessment unavailable - manual review in progress</span>
        </div>
      </div>
    );
  }

  const { approvalProbability, riskLevel, recommendation, factors } = riskAssessment;

  // Risk level colors
  const riskColors = {
    Low: {
      bg: 'bg-success-50 dark:bg-success-900/10',
      border: 'border-success-200 dark:border-success-800',
      text: 'text-success-700 dark:text-success-300',
      ring: 'stroke-success-600',
      icon: CheckCircle,
    },
    Medium: {
      bg: 'bg-warning-50 dark:bg-warning-900/10',
      border: 'border-warning-200 dark:border-warning-800',
      text: 'text-warning-700 dark:text-warning-300',
      ring: 'stroke-warning-600',
      icon: AlertTriangle,
    },
    High: {
      bg: 'bg-danger-50 dark:bg-danger-900/10',
      border: 'border-danger-200 dark:border-danger-800',
      text: 'text-danger-700 dark:text-danger-300',
      ring: 'stroke-danger-600',
      icon: AlertCircle,
    },
  };

  const colors = riskColors[riskLevel] || riskColors.Medium;
  const Icon = colors.icon;

  // Calculate circumference for progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (approvalProbability / 100) * circumference;

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-foreground dark:text-surfaceDark mb-6">
        AI Risk Assessment
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Approval Probability Ring */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            {/* Background Circle */}
            <svg className="transform -rotate-90" width="180" height="180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-surface dark:text-surfaceDark"
              />
              {/* Progress Circle with animation */}
              <motion.circle
                cx="90"
                cy="90"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className={colors.ring}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <p className="text-4xl font-bold text-foreground dark:text-surfaceDark">
                  {Math.round(approvalProbability)}%
                </p>
                <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary text-center">
                  Approval
                </p>
              </motion.div>
            </div>
          </div>

          {/* Risk Level Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`mt-4 px-4 py-2 rounded-full border ${colors.bg} ${colors.border} flex items-center gap-2`}
          >
            <Icon className={`h-4 w-4 ${colors.text}`} />
            <span className={`text-sm font-semibold ${colors.text}`}>
              {riskLevel} Risk
            </span>
          </motion.div>
        </div>

        {/* Right: Recommendation & Factors */}
        <div className="space-y-4">
          {/* Recommendation */}
          <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
            <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
              AI Recommendation
            </p>
            <p className={`text-xl font-bold ${colors.text}`}>
              {recommendation}
            </p>
          </div>

          {/* Contributing Factors */}
          {factors && (
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-foregroundSecondary mb-3">
                Contributing Factors
              </p>
              <div className="space-y-2">
                {Object.entries(factors).map(([key, value], index) => {
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  
                  const FactorIcon = value >= 70 ? TrendingUp : value >= 50 ? Minus : TrendingDown;
                  const iconColor = value >= 70 ? 'text-success-600' : value >= 50 ? 'text-warning-600' : 'text-danger-600';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FactorIcon className={`h-4 w-4 ${iconColor}`} />
                        <span className="text-sm text-foreground dark:text-foregroundSecondary">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface dark:bg-surfaceDark rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              value >= 70 ? 'bg-success-600' : value >= 50 ? 'bg-warning-600' : 'bg-danger-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground dark:text-foregroundSecondary w-8 text-right">
                          {Math.round(value)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Metadata */}
      {riskAssessment.assessedAt && (
        <div className="mt-6 pt-4 border-t border-border dark:border-borderDark dark:border-foregroundDark">
          <p className="text-xs text-surface0 dark:text-surface0Dark">
            Assessed on {new Date(riskAssessment.assessedAt).toLocaleString()}
            {riskAssessment.modelVersion && ` • Model: ${riskAssessment.modelVersion}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
