import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, FileText, AlertTriangle } from 'lucide-react';

/**
 * DocumentChecklist Component
 * 
 * Displays a real-time checklist of required documents for a loan application.
 * Shows which documents have been uploaded (green checkmark) and which are still missing (amber warning).
 * Includes OCR flag indicators for PAN/Aadhaar documents.
 * 
 * @param {Array} requiredDocuments - Array of required document types for the selected loan type
 * @param {Array} uploadedDocuments - Array of currently uploaded documents for this application
 * @param {boolean} compact - Optional compact view for admin screens
 */
const DocumentChecklist = ({ requiredDocuments = [], uploadedDocuments = [], compact = false }) => {
  // Normalize document names for comparison (case-insensitive, trim whitespace)
  const normalizeDocName = (name) => {
    return name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
  };

  // Create a Set of uploaded document types for quick lookup
  const uploadedDocTypes = new Set(
    uploadedDocuments.map(doc => normalizeDocName(doc.documentType))
  );

  // Check if any PAN/Aadhaar documents have OCR flags
  const hasOCRFlags = () => {
    return uploadedDocuments.some(doc => {
      if (!doc.ocrVerification) return false;
      const { ocrStatus, nameMismatch, invalidPAN, invalidAadhaar } = doc.ocrVerification;
      return ocrStatus === 'processed' && (nameMismatch || invalidPAN || invalidAadhaar);
    });
  };

  const ocrFlagsRaised = hasOCRFlags();

  // Calculate completion stats
  const totalRequired = requiredDocuments.length;
  const totalUploaded = requiredDocuments.filter(docType => 
    uploadedDocTypes.has(normalizeDocName(docType))
  ).length;
  const completionPercentage = totalRequired > 0 ? (totalUploaded / totalRequired) * 100 : 0;
  const isComplete = totalUploaded === totalRequired;

  // Get missing documents
  const missingDocuments = requiredDocuments.filter(docType => 
    !uploadedDocTypes.has(normalizeDocName(docType))
  );

  if (requiredDocuments.length === 0) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-3 text-foregroundSecondary dark:text-foregroundSecondary">
          <FileText className="h-5 w-5" />
          <span className="text-sm">No document requirements defined for this loan type</span>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact view for admin screens
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground dark:text-foregroundDark">
            Document Checklist
          </h4>
          <div className="flex items-center gap-2">
            {ocrFlagsRaised && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-warningBadge text-warningText border border-warningBorder dark:bg-warningBadgeDark dark:text-warningTextDark dark:border-warningBorderDark rounded-full text-xs font-medium"
                title="OCR flags detected on PAN/Aadhaar documents"
              >
                <AlertTriangle className="h-3 w-3" />
                OCR
              </motion.div>
            )}
            <span className={`text-sm font-medium ${
              isComplete
                ? 'text-success dark:text-successDark'
                : 'text-warning dark:text-warningDark'
            }`}>
              {totalUploaded}/{totalRequired}
            </span>
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-success dark:text-successDark" />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning dark:text-warningDark" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface dark:bg-surfaceDark rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full ${
              isComplete
                ? 'bg-success'
                : 'bg-warning'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Compact List */}
        <div className="space-y-1">
          {requiredDocuments.map((docType, index) => {
            const isUploaded = uploadedDocTypes.has(normalizeDocName(docType));
            return (
              <motion.div
                key={docType}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                {isUploaded ? (
                  <CheckCircle className="h-4 w-4 text-success dark:text-successDark flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-warning dark:text-warningDark flex-shrink-0" />
                )}
                <span className={
                  isUploaded
                    ? 'text-foreground dark:text-foregroundSecondary'
                    : 'text-warning dark:text-warningDark font-medium'
                }>
                  {docType}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full view for customer application flow
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground dark:text-foregroundDark">
            Document Checklist
          </h3>
          <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondary mt-1">
            {isComplete 
              ? 'All required documents uploaded!' 
              : `${missingDocuments.length} document${missingDocuments.length !== 1 ? 's' : ''} remaining`
            }
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            isComplete
              ? 'text-success dark:text-successDark'
              : 'text-warning dark:text-warningDark'
          }`}>
            {totalUploaded}/{totalRequired}
          </div>
          <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary">
            Documents
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-surface dark:bg-surfaceDark rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isComplete
                ? 'bg-gradient-to-r from-success to-successDark'
                : 'bg-gradient-to-r from-warning to-warningDark'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-foregroundSecondary dark:text-foregroundSecondary mt-1 text-right">
          {Math.round(completionPercentage)}% Complete
        </p>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {requiredDocuments.map((docType, index) => {
          const isUploaded = uploadedDocTypes.has(normalizeDocName(docType));
          const uploadedDoc = uploadedDocuments.find(
            doc => normalizeDocName(doc.documentType) === normalizeDocName(docType)
          );

          return (
            <motion.div
              key={docType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                isUploaded
                  ? 'bg-successBadge dark:bg-successBadgeDark border-successBorder dark:border-successBorderDark'
                  : 'bg-warningBadge dark:bg-warningBadgeDark border-warningBorder dark:border-warningBorderDark'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isUploaded
                        ? 'bg-success dark:bg-successDark'
                        : 'bg-warning dark:bg-warningDark'
                    }`}
                  >
                    {isUploaded ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-white" />
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <p className={`font-semibold ${
                      isUploaded
                        ? 'text-success dark:text-successDark'
                        : 'text-warning dark:text-warningDark'
                    }`}>
                      {docType}
                    </p>
                    {isUploaded && uploadedDoc ? (
                      <p className="text-xs text-success dark:text-successDark mt-0.5">
                        ✓ Uploaded: {uploadedDoc.fileName}
                        {uploadedDoc.verificationStatus === 'verified' && (
                          <span className="ml-2 font-medium">• Verified</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-warning dark:text-warningDark mt-0.5">
                        Required for loan approval
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isUploaded ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.08 + 0.3, type: 'spring' }}
                      className="px-3 py-1 bg-success dark:bg-successDark text-white text-xs font-bold rounded-full"
                    >
                      DONE
                    </motion.div>
                  ) : (
                    <div className="px-3 py-1 bg-warning dark:bg-warningDark text-white text-xs font-bold rounded-full">
                      PENDING
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Missing Documents Alert */}
      {!isComplete && missingDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-200 dark:border-warning-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-warning-900 dark:text-warning-200 mb-2">
                Still Required:
              </p>
              <ul className="space-y-1">
                {missingDocuments.map((doc) => (
                  <li key={doc} className="text-sm text-warning-800 dark:text-warning-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning-600 dark:bg-warning-400" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-success-50 dark:bg-success-900/10 border-2 border-success-200 dark:border-success-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-success-900 dark:text-success-200">
                All Documents Uploaded!
              </p>
              <p className="text-sm text-success-700 dark:text-success-300 mt-0.5">
                You can now proceed with your application.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentChecklist;
