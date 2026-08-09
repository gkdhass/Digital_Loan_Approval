import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, DollarSign, Briefcase, TrendingDown } from 'lucide-react';

const EligibilityScore = ({ eligibilityScore }) => {
  if (!eligibilityScore) {
    return null;
  }

  const { score, isEligible, reason, factors } = eligibilityScore;

  // Color scheme based on eligibility
  const colors = isEligible
    ? {
        bg: 'bg-successBadge dark:bg-successBadgeDark',
        border: 'border-successBorder dark:border-successBorderDark',
        text: 'text-successText dark:text-successTextDark',
        ring: 'stroke-success',
        icon: CheckCircle,
      }
    : {
        bg: 'bg-errorBadge dark:bg-errorBadgeDark',
        border: 'border-errorBorder dark:border-errorBorderDark',
        text: 'text-errorText dark:text-errorTextDark',
        ring: 'stroke-error',
        icon: XCircle,
      };

  const Icon = colors.icon;

  // Calculate circumference for progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Factor icons mapping
  const factorIcons = {
    income: DollarSign,
    employment: Briefcase,
    debtToIncome: TrendingDown,
  };

  // Render star rating
  const renderStars = (stars) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8 + starNum * 0.1, type: 'spring', stiffness: 200 }}
          >
            <Star
              className={`h-4 w-4 ${
                starNum <= stars
                  ? 'fill-secondary text-foregroundSecondary'
                  : 'fill-border text-border dark:fill-foregroundDark dark:text-foreground'
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark mb-6">
        Eligibility Assessment
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Eligibility Score Ring */}
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
                  {Math.round(score)}
                </p>
                <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary text-center">
                  out of 100
                </p>
              </motion.div>
            </div>
          </div>

          {/* Eligibility Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`mt-4 px-4 py-2 rounded-full border ${colors.bg} ${colors.border} flex items-center gap-2`}
          >
            <Icon className={`h-4 w-4 ${colors.text}`} />
            <span className={`text-sm font-semibold ${colors.text}`}>
              {isEligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </motion.div>
        </div>

        {/* Right: Reason & Factors */}
        <div className="space-y-4">
          {/* Reason */}
          <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
            <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mb-1">
              Assessment Result
            </p>
            <p className={`text-base font-semibold ${colors.text}`}>
              {reason}
            </p>
          </div>

          {/* Contributing Factors with Star Ratings */}
          {factors && (
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-foregroundSecondary mb-3">
                Factor Breakdown
              </p>
              <div className="space-y-3">
                {Object.entries(factors).map(([key, factorData], index) => {
                  const FactorIcon = factorIcons[key] || DollarSign;
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.15 }}
                      className="p-3 rounded-lg bg-surface dark:bg-backgroundDark/30 border border-surface dark:border-surfaceDark"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FactorIcon className="h-4 w-4 text-foregroundSecondary dark:text-foregroundSecondary" />
                          <span className="text-sm font-medium text-foregroundDark dark:text-border">
                            {factorData.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground dark:text-foregroundSecondary">
                          {factorData.score}/100
                        </span>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center justify-between">
                        {renderStars(factorData.stars)}
                        {factorData.ratio && (
                          <span className="text-xs text-foregroundSecondary dark:text-foregroundSecondary ml-2">
                            {factorData.ratio}
                          </span>
                        )}
                      </div>

                      {/* Additional factor info */}
                      {factorData.type && (
                        <p className="text-xs text-surface0 dark:text-surface0Dark mt-1 capitalize">
                          Type: {factorData.type}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Metadata */}
      {eligibilityScore.calculatedAt && (
        <div className="mt-6 pt-4 border-t border-border dark:border-borderDark dark:border-foregroundDark">
          <p className="text-xs text-surface0 dark:text-surface0Dark">
            Calculated on {new Date(eligibilityScore.calculatedAt).toLocaleString()}
            {' • Threshold: 60 points'}
          </p>
        </div>
      )}

      {/* Weight Information */}
      <div className="mt-4 p-3 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg">
        <p className="text-xs text-accent dark:text-accentDark">
          <strong>Scoring Weights:</strong> Income (40%), Employment Stability (30%), Debt-to-Income Ratio (30%)
        </p>
      </div>
    </div>
  );
};

export default EligibilityScore;
