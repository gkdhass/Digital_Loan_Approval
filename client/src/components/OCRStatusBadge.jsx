import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Loader2, FileQuestion, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * OCR Status Badge Component
 * 
 * Displays OCR verification status and flags for Aadhaar/PAN documents.
 * Shows advisory flags that inform admin's decision but don't auto-change document status.
 * 
 * @param {Object} ocrVerification - OCR verification data from document
 * @param {string} registeredName - User's registered name for comparison
 * @param {boolean} compact - Compact view for checklist
 */
const OCRStatusBadge = ({ ocrVerification, registeredName, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!ocrVerification) {
    return null; // No OCR data (not PAN/Aadhaar document)
  }

  const { ocrStatus, nameMismatch, invalidPAN, invalidAadhaar, confidence, extractedName, extractedPAN, extractedAadhaar, nameSimilarity } = ocrVerification;

  // Count flags
  const flags = [];
  if (nameMismatch) flags.push('Name Mismatch');
  if (invalidPAN) flags.push('Invalid PAN Format');
  if (invalidAadhaar) flags.push('Invalid Aadhaar Format');
  const hasFlags = flags.length > 0;

  // Determine status display
  let statusConfig = {};
  
  if (ocrStatus === 'pending') {
    statusConfig = {
      icon: Loader2,
      label: 'Processing...',
      color: 'text-primary dark:text-primaryDarkMode',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      border: 'border-primary-200 dark:border-primary-800',
      spin: true,
    };
  } else if (ocrStatus === 'processed') {
    if (hasFlags) {
      statusConfig = {
        icon: AlertTriangle,
        label: 'OCR Flags Raised',
        color: 'text-warning dark:text-warningDark',
        bg: 'bg-warningBadge dark:bg-warningBadgeDark',
        border: 'border-warningBorder dark:border-warningBorderDark',
      };
    } else {
      statusConfig = {
        icon: CheckCircle,
        label: 'OCR Verified',
        color: 'text-success dark:text-successDark',
        bg: 'bg-successBadge dark:bg-successBadgeDark',
        border: 'border-successBorder dark:border-successBorderDark',
      };
    }
  } else if (ocrStatus === 'unreadable') {
    statusConfig = {
      icon: FileQuestion,
      label: 'Could not read document',
      color: 'text-foregroundSecondary dark:text-foregroundSecondaryDark',
      bg: 'bg-surface dark:bg-surfaceDark/30',
      border: 'border-border dark:border-borderDark dark:border-foregroundDark',
      subtitle: 'Verify manually',
    };
  } else if (ocrStatus === 'failed') {
    statusConfig = {
      icon: AlertCircle,
      label: 'OCR unavailable',
      color: 'text-foregroundSecondary dark:text-foregroundSecondaryDark',
      bg: 'bg-surface dark:bg-surfaceDark/30',
      border: 'border-border dark:border-borderDark dark:border-foregroundDark',
      subtitle: 'Verify manually',
    };
  }

  const Icon = statusConfig.icon;

  // Compact view for checklist
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
        title={statusConfig.label + (hasFlags ? `: ${flags.join(', ')}` : '')}
      >
        <Icon className={`h-3 w-3 ${statusConfig.spin ? 'animate-spin' : ''}`} />
        {hasFlags && <span className="font-bold">{flags.length}</span>}
      </motion.div>
    );
  }

  // Full view for document details
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} overflow-hidden`}
    >
      {/* Header - Always visible */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
            <div>
              <p className={`text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </p>
              {statusConfig.subtitle && (
                <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-0.5">
                  {statusConfig.subtitle}
                </p>
              )}
            </div>
          </div>

          {ocrStatus === 'processed' && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
            >
              {expanded ? (
                <ChevronUp className={`h-4 w-4 ${statusConfig.color}`} />
              ) : (
                <ChevronDown className={`h-4 w-4 ${statusConfig.color}`} />
              )}
            </button>
          )}
        </div>

        {/* Flags Summary (when not expanded) */}
        {hasFlags && !expanded && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {flags.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark text-xs font-medium rounded"
              >
                • {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && ocrStatus === 'processed' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t-2 border-current overflow-hidden"
          >
            <div className="p-3 bg-white dark:bg-backgroundDark/50 space-y-3">
              {/* Extracted Values */}
              <div>
                <p className="text-xs font-semibold text-foregroundSecondary dark:text-foregroundSecondary mb-2">
                  Extracted Information:
                </p>
                <div className="space-y-2 text-xs">
                  {extractedName && (
                    <div className="flex justify-between items-start">
                      <span className="text-foregroundSecondary dark:text-foregroundSecondary">Name:</span>
                      <span className={`font-medium text-right ${nameMismatch ? 'text-warning dark:text-warningDark' : 'text-foreground dark:text-foregroundDark'}`}>
                        {extractedName}
                      </span>
                    </div>
                  )}
                  {extractedPAN && (
                    <div className="flex justify-between items-start">
                      <span className="text-foregroundSecondary dark:text-foregroundSecondary">PAN:</span>
                      <span className={`font-mono font-medium ${invalidPAN ? 'text-warning dark:text-warningDark' : 'text-foreground dark:text-foregroundDark'}`}>
                        {extractedPAN}
                      </span>
                    </div>
                  )}
                  {extractedAadhaar && (
                    <div className="flex justify-between items-start">
                      <span className="text-foregroundSecondary dark:text-foregroundSecondary">Aadhaar:</span>
                      <span className={`font-mono font-medium ${invalidAadhaar ? 'text-warning dark:text-warningDark' : 'text-foreground dark:text-foregroundDark'}`}>
                        {extractedAadhaar}
                      </span>
                    </div>
                  )}
                  {typeof nameSimilarity === 'number' && (
                    <div className="flex justify-between items-start">
                      <span className="text-foregroundSecondary dark:text-foregroundSecondary">Name Match:</span>
                      <span className={`font-medium ${nameSimilarity >= 70 ? 'text-success dark:text-successDark' : 'text-warning dark:text-warningDark'}`}>
                        {nameSimilarity}% similar
                      </span>
                    </div>
                  )}
                  {confidence && (
                    <div className="flex justify-between items-start">
                      <span className="text-foregroundSecondary dark:text-foregroundSecondary">Confidence:</span>
                      <span className="font-medium text-foreground dark:text-foregroundDark capitalize">
                        {confidence}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Comparison */}
              {nameMismatch && registeredName && extractedName && (
                <div className="p-2 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                  <p className="text-xs font-semibold text-warning dark:text-warningDark mb-2">
                    Name Mismatch Detected:
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-warning-700 dark:text-warning-300">Registered:</span>
                      <span className="font-medium text-warning-900 dark:text-warning-100">
                        {registeredName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warning-700 dark:text-warning-300">Extracted:</span>
                      <span className="font-medium text-warning-900 dark:text-warning-100">
                        {extractedName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flag Details */}
              {hasFlags && (
                <div>
                  <p className="text-xs font-semibold text-foregroundSecondary dark:text-foregroundSecondary mb-2">
                    Issues Found:
                  </p>
                  <ul className="space-y-1">
                    {flags.map((flag) => (
                      <li key={flag} className="flex items-start gap-2 text-xs text-warning dark:text-warningDark">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advisory Notice */}
              <div className="pt-2 border-t border-border dark:border-borderDark dark:border-foregroundDark">
                <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary italic">
                  ⓘ These are advisory flags only. Please review the document manually and make the final verification decision.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OCRStatusBadge;
