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
      bg: 'bg-successBadge dark:bg-successBadgeDark',
      border: 'border-successBorder dark:border-successBorderDark',
      text: 'text-successText dark:text-successTextDark',
      ring: 'stroke-success',
      icon: CheckCircle,
    },
    Medium: {
      bg: 'bg-warningBadge dark:bg-warningBadgeDark',
      border: 'border-warningBorder dark:border-warningBorderDark',
      text: 'text-warningText dark:text-warningTextDark',
      ring: 'stroke-warning',
      icon: AlertTriangle,
    },
    High: {
      bg: 'bg-errorBadge dark:bg-errorBadgeDark',
      border: 'border-errorBorder dark:border-errorBorderDark',
      text: 'text-errorText dark:text-errorTextDark',
      ring: 'stroke-error',
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
      <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark mb-6">
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
                className="text-surface dark:text-foregroundDark"
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
                <p className="text-4xl font-bold text-foreground dark:text-foregroundDark">
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
                  const iconColor = value >= 70 ? 'text-success' : value >= 50 ? 'text-warning' : 'text-error';

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
                              value >= 70 ? 'bg-success' : value >= 50 ? 'bg-warning' : 'bg-error'
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
