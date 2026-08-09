import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';

const DocumentUpload = ({ 
  onUpload, 
  documentTypes, 
  applicationId, 
  existingDocuments = [],
  onDeleteDocument 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  }, [selectedDocType, applicationId]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file) => {
    if (!selectedDocType) {
      setError('Please select a document type first');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('applicationId', applicationId);
      formData.append('documentType', selectedDocType);

      await onUpload(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setSelectedDocType('');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, 500);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleDelete = async (docId) => {
    if (onDeleteDocument) {
      await onDeleteDocument(docId);
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      identity_proof: 'Identity Proof',
      address_proof: 'Address Proof',
      income_proof: 'Income Proof',
      bank_statement: 'Bank Statement',
      property_documents: 'Property Documents',
      admission_letter: 'Admission Letter',
      vehicle_quotation: 'Vehicle Quotation',
      business_proof: 'Business Proof',
      itr: 'ITR Documents',
      business_plan: 'Business Plan',
      gold_appraisal: 'Gold Appraisal',
      land_documents: 'Land Documents',
      property_valuation: 'Property Valuation'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <label className="label mb-2">Document Type</label>
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="input-field"
          disabled={uploading}
        >
          <option value="">Select document type</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {getDocumentTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary-50'
            : 'border-border hover:border-primary hover:bg-input dark:hover:bg-cardSecondaryDark'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={uploading || !selectedDocType}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Loader2 className="h-12 w-12 text-primary dark:text-primaryDark mx-auto animate-spin" />
              <div>
                <p className="font-semibold text-foreground dark:text-foregroundDark">Uploading...</p>
                <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-border dark:bg-borderDark rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="bg-primary h-2 rounded-full transition-all"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="mx-auto h-16 w-16 bg-input dark:bg-cardDark rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-foregroundMuted dark:text-foregroundMutedDark" />
              </div>
              <div>
                <p className="font-semibold text-foreground dark:text-foregroundDark">
                  {selectedDocType ? 'Drop your file here' : 'Select a document type first'}
                </p>
                <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mt-1">
                  or click to browse
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onButtonClick}
                disabled={!selectedDocType}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose File
              </motion.button>
              <p className="text-xs text-foregroundMuted dark:text-foregroundMutedDark">
                Supported formats: JPEG, PNG, PDF (Max 5MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 left-4 p-3 bg-errorBadge dark:bg-errorDark/20 border border-errorBorder dark:border-errorDark rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-error dark:text-errorDark flex-shrink-0" />
            <p className="text-sm text-error dark:text-errorDark">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-error dark:text-errorDark hover:text-error dark:hover:text-errorDark"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground dark:text-foregroundDark">Uploaded Documents</h4>
          <div className="space-y-2">
            {existingDocuments.map((doc) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-input dark:bg-cardSecondaryDark rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-card dark:bg-cardDark rounded-lg flex items-center justify-center border border-border">
                    <FileText className="h-5 w-5 text-foregroundSecondary dark:text-foregroundSecondaryDark" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-foregroundDark">{doc.fileName}</p>
                    <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                      {getDocumentTypeLabel(doc.documentType)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.verificationStatus === 'verified' && (
                    <div className="flex items-center gap-1 text-success dark:text-successDark">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                  {doc.verificationStatus === 'rejected' && (
                    <div className="flex items-center gap-1 text-error dark:text-errorDark">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-foregroundMuted dark:text-foregroundMutedDark hover:text-error dark:hover:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
